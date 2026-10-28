import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

type Context = IExecuteFunctions | ILoadOptionsFunctions;

interface McpToolResult {
	content?: Array<{ type?: string; text?: string }>;
	structuredContent?: unknown;
	isError?: boolean;
}

interface McpResponse {
	result?: McpToolResult;
	error?: { code?: number; message?: string; data?: unknown };
}

interface ToolEnvelope {
	status?: string;
	data?: IDataObject;
	message?: string;
	kind?: string;
}

function isObject(value: unknown): value is IDataObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The endpoint answers with JSON, or with a single server-sent event when asked for a stream. */
function parseResponseBody(body: unknown): McpResponse {
	if (isObject(body)) return body as McpResponse;
	if (typeof body !== 'string') return {};
	const payload = body.includes('data:')
		? body
				.split('\n')
				.filter((line) => line.startsWith('data:'))
				.map((line) => line.slice(5).trim())
				.join('')
		: body;
	try {
		const parsed: unknown = JSON.parse(payload);
		return isObject(parsed) ? (parsed as McpResponse) : {};
	} catch {
		return {};
	}
}

function readEnvelope(result: McpToolResult): ToolEnvelope {
	if (isObject(result.structuredContent)) return result.structuredContent as ToolEnvelope;
	const text = result.content?.find((part) => part.type === 'text')?.text;
	if (text) {
		try {
			const parsed: unknown = JSON.parse(text);
			if (isObject(parsed)) return parsed as ToolEnvelope;
		} catch {
			// Plain-text errors fall through to the message below.
		}
	}
	return { status: 'error', message: text };
}

/**
 * Calls one Dynamoi tool on the hosted MCP endpoint (JSON-RPC `tools/call`) and returns the
 * tool's `data` payload. Tool and protocol errors become node errors with Dynamoi's message.
 */
export async function dynamoiTool(
	this: Context,
	tool: string,
	args: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('dynamoiOAuth2Api');
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: credentials.serverUrl as string,
		headers: { Accept: 'application/json' },
		body: {
			jsonrpc: '2.0',
			id: 1,
			method: 'tools/call',
			params: { name: tool, arguments: args },
		},
		json: true,
	};

	let body: unknown;
	try {
		body = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'dynamoiOAuth2Api',
			options,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}

	const response = parseResponseBody(body);
	if (response.error) {
		throw new NodeOperationError(
			this.getNode(),
			response.error.message ?? 'Dynamoi rejected the request',
			{ description: response.error.code === undefined ? undefined : `Code ${response.error.code}` },
		);
	}
	if (!response.result) {
		throw new NodeOperationError(this.getNode(), 'Dynamoi returned an empty response', {
			description: 'The MCP endpoint did not send a tool result. Try again in a moment.',
		});
	}

	const envelope = readEnvelope(response.result);
	if (response.result.isError || envelope.status === 'error') {
		throw new NodeOperationError(this.getNode(), envelope.message ?? 'Dynamoi returned an error', {
			description: envelope.kind ? `Error type: ${envelope.kind}` : undefined,
		});
	}

	const data = envelope.data ?? {};
	if (envelope.status === 'partial_success') {
		return { ...data, partialSuccess: true, message: envelope.message ?? null };
	}
	return data;
}
