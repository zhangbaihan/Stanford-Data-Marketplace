export interface Provenance {
  creator: string;
  contributors?: Array<{
    name: string;
    role: string;
  }>;
  doi?: string;
}

export interface Dataset {
  id: string;
  title: string;
  description: string;
  abstract?: string;
  tableCount: number;
  fileCount: number;
  size: string;
  tags: string[];
  lastUpdated: string;
  version?: string;
  provenance: Provenance;
  methodology: string;
  usageNotes?: string;
  supportingFiles?: Array<{
    name: string;
    type: string;
  }>;
  links?: Array<{
    name: string;
    url: string;
  }>;
  license?: string;
  contact?: {
    name: string;
    email: string;
  };
}

export const mockDatasets: Dataset[] = [
  {
    id: '1',
    title: 'Cotality Smart Data Platform: Property',
    description: 'Tax assessment data for all U.S. states, the U.S. Virgin Islands, Guam, and Washington, D.C., as of June 2024. Formerly known as CoreLogic Smart Data Platform (SDP): Property.',
    abstract: 'Tax assessment data for all U.S. states, the U.S. Virgin Islands, Guam, and Washington, D.C., as of June 2024.',
    tableCount: 1,
    fileCount: 0,
    size: '144 GB',
    version: '3.0',
    tags: ['property tax', 'united states', 'real property'],
    lastUpdated: '2026-01-30',
    provenance: {
      creator: 'CoreLogic NZ Limited Cotality',
      contributors: [
        { name: 'Stanford University Libraries SUL', role: 'Distributor' },
        { name: 'Kate Barron', role: 'Data curator' },
        { name: 'Ron Nakao', role: 'Contact person' },
      ],
      doi: '10.57761/s5cs-r369',
    },
    methodology: `In the United States, parcel data is public record information that describes a division of land (also referred to as "property" or "real estate"). Each parcel is given a unique identifier called an Assessor's Parcel Number or APN. The two principal types of records maintained by county government agencies for each parcel of land are deed and property tax records. When a real estate transaction takes place (e.g. a change in ownership), a property deed must be signed by both the buyer and seller. The deed will then be filed with the County Recorder's offices, sometimes called the County Clerk-Recorder or other similar title. Property tax records are maintained by County Tax Assessor's offices; they show the amount of taxes assessed on a parcel and include a detailed description of any structures or buildings on the parcel, including year built, square footages, building type, amenities like a pool, etc. There is not a uniform format for storing parcel data across the thousands of counties and county equivalents in the U.S.; laws and regulations governing real estate/property sales vary by state. Counties and county equivalents also have inconsistent approaches to archiving historical parcel data.

To fill researchers' needs for uniform parcel data, Cotality collects, cleans, and normalizes public records that they collect from U.S. County Assessor and Recorder offices. Cotality augments this data with information gathered from other public and non-public sources (e.g., loan issuers, real estate agents, landlords, etc.). The Stanford Libraries has purchased bulk extracts from Cotality's parcel data, including mortgage, owner transfer, pre-foreclosure, and historical and contemporary tax assessment data. Data is bundled into pipe-delimited text files, which are uploaded to Data Farm (Redivis) for preview, extraction and analysis.`,
    usageNotes: 'The Property, Mortgage, Owner Transfer, Historical Property and Pre-Foreclosure data can be linked on the CLIP, a unique identification number assigned to each property. Census tracts are based on the 2020 census.',
    supportingFiles: [
      { name: 'cotality_sdp_property_data_dictionary_2024.txt', type: 'text' },
      { name: 'cotality_sdp_property_counts_2024.txt', type: 'text' },
      { name: 'Property_v3.xlsx', type: 'spreadsheet' },
      { name: '2025_Legacy_Content_Mapping.pdf', type: 'pdf' },
    ],
    links: [
      { name: 'SearchWorks Cotality datasets collection', url: '#' },
      { name: 'Cotality 2024 GitLab', url: '#' },
    ],
    license: 'Cotality Bulk Data (Tax, Deed, and Pre-Foreclosure) End User License Agreement',
    contact: {
      name: 'Ron Nakao',
      email: 'ronbo@stanford.edu',
    },
  },
  {
    id: '2',
    title: 'Cotality Smart Data Platform: Owner Transfer and Mortgage',
    description: 'The Owner Transfer and Mortgage data covers over 450 million properties, and includes over 50 years of sales transactions, ownership transfers, and mortgage information.',
    abstract: 'The Owner Transfer and Mortgage data covers over 450 million properties, and includes over 50 years of sales transactions, ownership transfers, and mortgage information.',
    tableCount: 2,
    fileCount: 0,
    size: '526 GB',
    tags: ['property', 'mortgage', 'real estate'],
    lastUpdated: '2026-01-28',
    provenance: {
      creator: 'CoreLogic NZ Limited Cotality',
      contributors: [
        { name: 'Stanford University Libraries SUL', role: 'Distributor' },
      ],
    },
    methodology: 'The Owner Transfer and Mortgage dataset combines property deed records from County Recorder offices with mortgage information from various financial institutions. Data is collected, cleaned, and normalized to provide a comprehensive view of property transactions and financing across the United States.',
    usageNotes: 'This dataset can be linked with other Cotality datasets using the CLIP (Cotality Location Identifier for Properties) number.',
  },
  {
    id: '3',
    title: 'L2 Voter and Demographic Dataset',
    description: 'The L2 Voter and Demographic Dataset includes demographic and voter history tables for all 50 states and the District of Columbia. The dataset is built from publicly available government records.',
    abstract: 'The L2 Voter and Demographic Dataset includes demographic and voter history tables for all 50 states and the District of Columbia.',
    tableCount: 102,
    fileCount: 0,
    size: '2.1 TB',
    tags: ['voting', 'demographics', 'politics'],
    lastUpdated: '2026-01-25',
    provenance: {
      creator: 'L2 Political',
      contributors: [
        { name: 'Stanford University Libraries SUL', role: 'Distributor' },
      ],
    },
    methodology: 'The dataset is built from publicly available government records including voter registration files, election results, and census demographic data. Data is aggregated and standardized across all states to enable cross-state analysis.',
    usageNotes: 'Voter history data is updated regularly following each election cycle. Demographic data is aligned with the most recent decennial census.',
  },
  {
    id: '4',
    title: 'Cotality Smart Data Platform: Historical Property',
    description: 'Historical tax assessment data for all U.S. states, the U.S. Virgin Islands, Guam, and Washington, D.C. Each table represents a different time period.',
    abstract: 'Historical tax assessment data for all U.S. states, the U.S. Virgin Islands, Guam, and Washington, D.C.',
    tableCount: 15,
    fileCount: 0,
    size: '892 GB',
    tags: ['property tax', 'historical data', 'real estate'],
    lastUpdated: '2026-01-22',
    provenance: {
      creator: 'CoreLogic NZ Limited Cotality',
    },
    methodology: 'Historical property tax assessment records are collected from county archives and digitized. Each table represents a snapshot of property assessments at a specific point in time, allowing for longitudinal analysis of property values and characteristics.',
  },
  {
    id: '5',
    title: 'The Washington Post',
    description: 'All articles were printed in the physical newspaper, and may or may not appear on the Washington Post website. Article data goes as far back as 1977. New article data is appended quarterly.',
    abstract: 'All articles were printed in the physical newspaper, and may or may not appear on the Washington Post website.',
    tableCount: 50,
    fileCount: 0,
    size: '1.8 TB',
    tags: ['news', 'journalism', 'text analysis'],
    lastUpdated: '2026-01-20',
    provenance: {
      creator: 'The Washington Post',
    },
    methodology: 'Articles are extracted from the physical newspaper archives and digitized. Metadata includes publication date, section, author, and article text. New article data is appended quarterly.',
    usageNotes: 'Article data goes as far back as 1977. Some articles may not appear on the Washington Post website.',
  },
  {
    id: '6',
    title: 'The New York Times TDM Archive',
    description: '41-Year Textual Digital Archive of nytimes.com, which consists of all available articles (approximately 4,000,000) published by The New York Times, including but not limited to news, lifestyle, and opinion pieces.',
    abstract: '41-Year Textual Digital Archive of nytimes.com, which consists of all available articles (approximately 4,000,000) published by The New York Times.',
    tableCount: 43,
    fileCount: 0,
    size: '2.3 TB',
    tags: ['news', 'journalism', 'text analysis', 'new york times'],
    lastUpdated: '2026-01-18',
    provenance: {
      creator: 'The New York Times',
    },
    methodology: 'The archive includes all available articles from nytimes.com spanning 41 years. Articles are categorized by type (news, lifestyle, opinion, etc.) and include full text, metadata, and publication information.',
  },
  {
    id: '7',
    title: 'Gallup World Poll',
    description: "Gallup's World Poll continually surveys residents in more than 150 countries and areas, representing more than 98% of the world's adult population, using randomly selected, nationally representative samples.",
    abstract: "Gallup's World Poll continually surveys residents in more than 150 countries and areas, representing more than 98% of the world's adult population.",
    tableCount: 1,
    fileCount: 0,
    size: '1.3 TB',
    tags: ['survey', 'polling', 'global', 'demographics'],
    lastUpdated: '2026-01-15',
    provenance: {
      creator: 'Gallup',
    },
    methodology: "Gallup's World Poll uses randomly selected, nationally representative samples to survey residents in more than 150 countries and areas. Surveys cover topics including well-being, economics, politics, and social issues.",
  },
  {
    id: '8',
    title: 'Cotality Building Permits',
    description: 'Building Permit data from all U.S. states and Washington, D.C. as of October 2020. Formerly known as CoreLogic Building Permits.',
    abstract: 'Building Permit data from all U.S. states and Washington, D.C. as of October 2020.',
    tableCount: 1,
    fileCount: 0,
    size: '45 GB',
    tags: ['building permits', 'construction', 'real estate'],
    lastUpdated: '2026-01-12',
    provenance: {
      creator: 'CoreLogic NZ Limited Cotality',
    },
    methodology: 'Building permit data is collected from local and county government offices across all U.S. states and Washington, D.C. The dataset includes information about permit type, location, value, and construction details.',
    usageNotes: 'Data is current as of October 2020. Formerly known as CoreLogic Building Permits.',
  },
];
