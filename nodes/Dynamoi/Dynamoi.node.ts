import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { dynamoiProperties } from './descriptions';
import { dynamoiTool } from './GenericFunctions';

const LIST_KEYS: Record<string, string> = {
	'artist.list': 'artists',
	'campaign.list': 'campaigns',
	'smartLink.list': 'smartLinks',
};

const SUBTITLES: Record<string, string> = {
	'smartLink.createFromRelease': 'Smart Link: Create From Release',
	'smartLink.createForArtist': 'Smart Link: Create or Refresh',
	'smartLink.get': 'Smart Link: Get',
	'smartLink.list': 'Smart Link: Get Many',
	'smartLink.updateDescription': 'Smart Link: Update Description',
	'smartLink.updateTheme': 'Smart Link: Update Theme',
	'artist.list': 'Artist: Get Many',
	'analytics.getArtist': 'Analytics: Artist',
	'analytics.getAudience': 'Analytics: Audience',
	'campaign.get': 'Campaign: Get',
	'campaign.list': 'Campaign: Get Many',
};

function artistOf(context: IExecuteFunctions, index: number): string {
	return context.getNodeParameter('artistId', index, '', { extractValue: true }) as string;
}

function dateRangeOf(
	context: IExecuteFunctions,
	options: IDataObject,
	index: number,
): IDataObject | undefined {
	const start = options.startDate as string | undefined;
	const end = options.endDate as string | undefined;
	if (!start && !end) return undefined;
	if (!start || !end) {
		throw new NodeOperationError(context.getNode(), 'Set both a start date and an end date', {
			itemIndex: index,
		});
	}
	return { start: start.slice(0, 10), end: end.slice(0, 10) };
}

function buildRequest(
	context: IExecuteFunctions,
	resource: string,
	operation: string,
	index: number,
): { tool: string; args: IDataObject } {
	const param = (name: string, fallback: unknown = '') =>
		context.getNodeParameter(name, index, fallback) as never;
	const options = param('options', {}) as IDataObject;
	const filters = param('filters', {}) as IDataObject;
	const key = `${resource}.${operation}`;

	switch (key) {
		case 'smartLink.createFromRelease':
			return {
				tool: 'dynamoi_create_smart_link_from_spotify',
				args: {
					artistId: artistOf(context, index),
					spotifyUrl: param('spotifyUrl'),
					...(options.customDescription ? { customDescription: options.customDescription } : {}),
				},
			};
		case 'smartLink.createForArtist':
			return {
				tool: 'dynamoi_create_smart_links_from_spotify_artist',
				args: {
					spotifyArtistUrl: param('spotifyArtistUrl'),
					...(options.artistId ? { artistId: options.artistId } : {}),
				},
			};
		case 'smartLink.get': {
			const analytics = options.includeAnalytics === true;
			const dateRange = analytics ? dateRangeOf(context, options, index) : undefined;
			return {
				tool: 'dynamoi_get_smart_link',
				args: {
					playLinkId: param('playLinkId'),
					...(analytics
						? {
								includeAnalytics: true,
								...(dateRange ? { dateRange } : {}),
								...(options.granularity ? { granularity: options.granularity } : {}),
								...(options.includeBreakdowns ? { includeBreakdowns: true } : {}),
							}
						: {}),
				},
			};
		}
		case 'smartLink.list':
			return {
				tool: 'dynamoi_list_smart_links',
				args: {
					artistId: artistOf(context, index),
					...(filters.query ? { query: filters.query } : {}),
					...(filters.publishState ? { publishState: filters.publishState } : {}),
				},
			};
		case 'smartLink.updateDescription':
			return {
				tool: 'dynamoi_update_smart_link',
				args: {
					action: 'update_description',
					playLinkId: param('playLinkId'),
					customDescription: param('customDescription') || null,
				},
			};
		case 'smartLink.updateTheme':
			return {
				tool: 'dynamoi_update_smart_link',
				args: {
					action: 'update_artist_settings',
					artistId: artistOf(context, index),
					theme: param('theme'),
				},
			};
		case 'artist.list':
			return { tool: 'dynamoi_list_artists', args: {} };
		case 'analytics.getArtist': {
			const dateRange = dateRangeOf(context, options, index);
			return {
				tool: 'dynamoi_get_artist_analytics',
				args: {
					artistId: artistOf(context, index),
					...(dateRange ? { dateRange } : {}),
					...(options.granularity ? { granularity: options.granularity } : {}),
				},
			};
		}
		case 'analytics.getAudience':
			return {
				tool: 'dynamoi_get_audience_analytics',
				args: { artistId: artistOf(context, index), range: param('range', '30d') },
			};
		case 'campaign.list':
			return {
				tool: 'dynamoi_list_campaigns',
				args: {
					artistId: artistOf(context, index),
					...(filters.campaignType ? { campaignType: filters.campaignType } : {}),
					...(filters.status ? { status: filters.status } : {}),
				},
			};
		case 'campaign.get': {
			const analytics = options.includeAnalytics === true;
			const dateRange = analytics ? dateRangeOf(context, options, index) : undefined;
			return {
				tool: 'dynamoi_get_campaign',
				args: {
					campaignId: param('campaignId'),
					...(analytics
						? {
								includeAnalytics: true,
								...(dateRange ? { analyticsDateRange: dateRange } : {}),
								...(options.granularity ? { analyticsGranularity: options.granularity } : {}),
							}
						: {}),
				},
			};
		}
		default:
			throw new NodeOperationError(context.getNode(), `Unsupported operation: ${key}`, {
				itemIndex: index,
			});
	}
}

/** Runs a list tool, following Dynamoi's page cursor until the requested count is reached. */
async function listAll(
	context: IExecuteFunctions,
	tool: string,
	args: IDataObject,
	listKey: string,
	index: number,
): Promise<IDataObject[]> {
	const returnAll = context.getNodeParameter('returnAll', index, false) as boolean;
	const limit = returnAll ? Infinity : (context.getNodeParameter('limit', index, 50) as number);
	const rows: IDataObject[] = [];
	let cursor: string | undefined;
	do {
		const page = await dynamoiTool.call(context, tool, {
			...args,
			limit: Math.min(50, limit - rows.length),
			...(cursor ? { cursor } : {}),
		});
		rows.push(...((page[listKey] as IDataObject[] | undefined) ?? []));
		cursor = page.nextCursor as string | undefined;
	} while (cursor && rows.length < limit);
	return rows.slice(0, limit);
}

export class Dynamoi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dynamoi',
		name: 'dynamoi',
		icon: { light: 'file:dynamoi.svg', dark: 'file:dynamoi.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: `={{ (${JSON.stringify(SUBTITLES)})[$parameter["resource"] + "." + $parameter["operation"]] }}`,
		description: 'Producing AI music? Promote it free with Dynamoi',
		defaults: { name: 'Dynamoi' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'dynamoiOAuth2Api', required: true }],
		properties: dynamoiProperties,
	};

	methods = {
		listSearch: {
			async searchArtists(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = await dynamoiTool.call(this, 'dynamoi_list_artists', {
					limit: 50,
					...(paginationToken ? { cursor: paginationToken } : {}),
				});
				const needle = filter?.toLowerCase();
				const results = ((page.artists as IDataObject[] | undefined) ?? [])
					.map((artist) => ({
						name: String(artist.name ?? artist.artistName ?? artist.id),
						value: String(artist.id ?? artist.artistId),
					}))
					.filter((artist) => !needle || artist.name.toLowerCase().includes(needle));
				return { results, paginationToken: page.nextCursor as string | undefined };
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const { tool, args } = buildRequest(this, resource, operation, i);
				const listKey = LIST_KEYS[`${resource}.${operation}`];
				const rows = listKey
					? await listAll(this, tool, args, listKey, i)
					: [await dynamoiTool.call(this, tool, args)];
				returnData.push(
					...this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(rows), {
						itemData: { item: i },
					}),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
