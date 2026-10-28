import type { INodeProperties } from 'n8n-workflow';

const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

type Show = { resource: string[]; operation: string[] };

function artistField(show: Show): INodeProperties {
	return {
		displayName: 'Artist',
		name: 'artistId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The artist in your Dynamoi account',
		displayOptions: { show },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchArtists', searchable: true },
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 3f2c9a1e-5b7d-4c8a-9e10-2a6b4d8f0c11',
				validation: [
					{
						type: 'regex',
						properties: { regex: `^${UUID}$`, errorMessage: 'Not a valid artist ID' },
					},
				],
			},
		],
	};
}

function returnAllFields(show: Show): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			displayOptions: { show },
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			description: 'Max number of results to return',
			typeOptions: { minValue: 1, maxValue: 50 },
			displayOptions: { show: { ...show, returnAll: [false] } },
		},
	];
}

const dateFields = (): INodeProperties[] => [
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		description: 'First day to include. Set an end date too.',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		description: 'Last day to include. Set a start date too.',
	},
	{
		displayName: 'Granularity',
		name: 'granularity',
		type: 'options',
		options: [
			{ name: 'Daily', value: 'DAILY' },
			{ name: 'Total', value: 'TOTAL' },
		],
		default: 'TOTAL',
		description: 'Whether to return one total or one row per day',
	},
];

export const dynamoiProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Analytics', value: 'analytics' },
			{ name: 'Artist', value: 'artist' },
			{ name: 'Campaign', value: 'campaign' },
			{ name: 'Smart Link', value: 'smartLink' },
		],
		default: 'smartLink',
	},

	// Smart Link
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['smartLink'] } },
		options: [
			{
				name: 'Create From Spotify Release',
				value: 'createFromRelease',
				description: 'Create a free Smart Link from a Spotify album, single or track link',
				action: 'Create a smart link from a release',
			},
			{
				name: 'Create or Refresh for Spotify Artist',
				value: 'createForArtist',
				description: "Import an artist's catalog as Smart Links and return the artist page",
				action: 'Create or refresh smart links for an artist',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one Smart Link, with its analytics if you want them',
				action: 'Get a smart link',
			},
			{
				name: 'Get Many',
				value: 'list',
				description: "List an artist's Smart Links",
				action: 'Get many smart links',
			},
			{
				name: 'Update Description',
				value: 'updateDescription',
				description: "Change a Smart Link's public description",
				action: 'Update a smart link description',
			},
			{
				name: 'Update Theme',
				value: 'updateTheme',
				description: "Change the theme of an artist's Smart Links",
				action: 'Update the smart link theme for an artist',
			},
		],
		default: 'createFromRelease',
	},
	artistField({
		resource: ['smartLink'],
		operation: ['createFromRelease', 'list', 'updateTheme'],
	}),
	{
		displayName: 'Spotify Release URL',
		name: 'spotifyUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. https://open.spotify.com/album/…',
		description: 'A Spotify album, single or track link, or a Spotify URI',
		displayOptions: { show: { resource: ['smartLink'], operation: ['createFromRelease'] } },
	},
	{
		displayName: 'Spotify Artist URL',
		name: 'spotifyArtistUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. https://open.spotify.com/artist/…',
		description: 'The artist link from Spotify',
		displayOptions: { show: { resource: ['smartLink'], operation: ['createForArtist'] } },
	},
	{
		displayName: 'Smart Link ID',
		name: 'playLinkId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the Smart Link. Get it from the Get Many operation.',
		displayOptions: {
			show: { resource: ['smartLink'], operation: ['get', 'updateDescription'] },
		},
	},
	{
		displayName: 'Description',
		name: 'customDescription',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'The public description, up to 500 characters. Leave empty to clear it.',
		displayOptions: { show: { resource: ['smartLink'], operation: ['updateDescription'] } },
	},
	{
		displayName: 'Theme',
		name: 'theme',
		type: 'options',
		options: [
			{ name: 'Aurora', value: 'aurora' },
			{ name: 'Brutalist', value: 'brutalist' },
			{ name: 'Cinematic', value: 'cinematic' },
			{ name: 'Classic', value: 'classic' },
		],
		default: 'classic',
		description: "The look of the artist's Smart Links",
		displayOptions: { show: { resource: ['smartLink'], operation: ['updateTheme'] } },
	},
	...returnAllFields({ resource: ['smartLink'], operation: ['list'] }),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['smartLink'], operation: ['createFromRelease'] } },
		options: [
			{
				displayName: 'Description',
				name: 'customDescription',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'A public description for the Smart Link, up to 500 characters',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['smartLink'], operation: ['createForArtist'] } },
		options: [
			{
				displayName: 'Existing Artist ID',
				name: 'artistId',
				type: 'string',
				default: '',
				description:
					'Refresh the Smart Links of an artist already in your account. Leave empty to create your first artist from the Spotify profile.',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['smartLink'], operation: ['get'] } },
		options: [
			{
				displayName: 'Include Analytics',
				name: 'includeAnalytics',
				type: 'boolean',
				default: false,
				description: 'Whether to include visit and click analytics for the Smart Link',
			},
			...dateFields(),
			{
				displayName: 'Include Breakdowns',
				name: 'includeBreakdowns',
				type: 'boolean',
				default: false,
				description: 'Whether to split analytics by source and destination',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['smartLink'], operation: ['list'] } },
		options: [
			{
				displayName: 'Publish State',
				name: 'publishState',
				type: 'options',
				options: [
					{ name: 'Published', value: 'published' },
					{ name: 'Unpublished', value: 'unpublished' },
				],
				default: 'published',
			},
			{
				displayName: 'Search',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Match release titles',
			},
		],
	},

	// Artist
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['artist'] } },
		options: [
			{
				name: 'Get Many',
				value: 'list',
				description: 'List the artists in your Dynamoi account',
				action: 'Get many artists',
			},
		],
		default: 'list',
	},
	...returnAllFields({ resource: ['artist'], operation: ['list'] }),

	// Analytics
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['analytics'] } },
		options: [
			{
				name: 'Get Artist Analytics',
				value: 'getArtist',
				description: "Get results across all of an artist's campaigns",
				action: 'Get artist analytics',
			},
			{
				name: 'Get Audience Analytics',
				value: 'getAudience',
				description: "Get an artist's streaming audience by country, service and day",
				action: 'Get audience analytics',
			},
		],
		default: 'getArtist',
	},
	artistField({ resource: ['analytics'], operation: ['getArtist', 'getAudience'] }),
	{
		displayName: 'Range',
		name: 'range',
		type: 'options',
		options: [
			{ name: 'Last 7 Days', value: '7d' },
			{ name: 'Last 30 Days', value: '30d' },
			{ name: 'Last 90 Days', value: '90d' },
		],
		default: '30d',
		description: 'The period to report on',
		displayOptions: { show: { resource: ['analytics'], operation: ['getAudience'] } },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['analytics'], operation: ['getArtist'] } },
		options: dateFields(),
	},

	// Campaign
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['campaign'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get one campaign, with its results if you want them',
				action: 'Get a campaign',
			},
			{
				name: 'Get Many',
				value: 'list',
				description: "List an artist's campaigns",
				action: 'Get many campaigns',
			},
		],
		default: 'list',
	},
	artistField({ resource: ['campaign'], operation: ['list'] }),
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the campaign. Get it from the Get Many operation.',
		displayOptions: { show: { resource: ['campaign'], operation: ['get'] } },
	},
	...returnAllFields({ resource: ['campaign'], operation: ['list'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['campaign'], operation: ['list'] } },
		options: [
			{
				displayName: 'Campaign Type',
				name: 'campaignType',
				type: 'options',
				options: [
					{ name: 'Smart Campaign', value: 'SMART_CAMPAIGN' },
					{ name: 'YouTube', value: 'YOUTUBE' },
				],
				default: 'SMART_CAMPAIGN',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'ACTIVE' },
					{ name: 'Archived', value: 'ARCHIVED' },
					{ name: 'Awaiting Smart Link', value: 'AWAITING_SMART_LINK' },
					{ name: 'Content Validation', value: 'CONTENT_VALIDATION' },
					{ name: 'Deploying', value: 'DEPLOYING' },
					{ name: 'Ended', value: 'ENDED' },
					{ name: 'Failed', value: 'FAILED' },
					{ name: 'Paused', value: 'PAUSED' },
					{ name: 'Ready for Review', value: 'READY_FOR_REVIEW' },
					{ name: 'Subscription Paused', value: 'SUBSCRIPTION_PAUSED' },
				],
				default: 'ACTIVE',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['campaign'], operation: ['get'] } },
		options: [
			{
				displayName: 'Include Analytics',
				name: 'includeAnalytics',
				type: 'boolean',
				default: false,
				description: 'Whether to include delivery results for the campaign',
			},
			...dateFields(),
		],
	},
];
