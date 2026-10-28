import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DynamoiOAuth2Api implements ICredentialType {
	name = 'dynamoiOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Dynamoi OAuth2 API';

	icon = { light: 'file:../nodes/Dynamoi/dynamoi.svg', dark: 'file:../nodes/Dynamoi/dynamoi.dark.svg' } as const;

	documentationUrl = 'https://github.com/getDynamoi/n8n-nodes-dynamoi#credentials';

	// Dynamoi registers n8n as an OAuth client on connect (dynamic client registration), so there
	// is no client ID or secret to paste. n8n discovers the authorization server from the MCP
	// endpoint's protected-resource metadata.
	properties: INodeProperties[] = [
		{
			displayName: 'Use Dynamic Client Registration',
			name: 'useDynamicClientRegistration',
			type: 'hidden',
			default: true,
		},
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'hidden',
			default: 'https://dynamoi.com/mcp',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			method: 'POST',
			headers: { Accept: 'application/json' },
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: { name: 'dynamoi_get_account_overview', arguments: { format: 'summary' } },
			},
		},
	};
}
