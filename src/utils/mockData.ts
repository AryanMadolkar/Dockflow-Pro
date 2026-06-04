import type { Berth, PortCall } from '../types';

export const mockBerths: Berth[] = [
  { id: 'berth-1', name: 'North Quay 1', terminal: 'Dry Bulk Terminal', length: 280, depth: 14.5, occupiedVesselId: 'pc-1' },
  { id: 'berth-2', name: 'North Quay 2', terminal: 'Dry Bulk Terminal', length: 250, depth: 13.0 },
  { id: 'berth-3', name: 'South Pier', terminal: 'Liquid Cargo Pier', length: 300, depth: 16.0 },
  { id: 'berth-4', name: 'Container Terminal A', terminal: 'Container Hub', length: 350, depth: 15.5, occupiedVesselId: 'pc-3' },
  { id: 'berth-5', name: 'LNG Jetty', terminal: 'Gas Terminal', length: 290, depth: 12.5 }
];

export const mockPortCalls: PortCall[] = [
  {
    id: 'pc-1',
    vessel: {
      imo: '9432074',
      name: 'OCEAN VOYAGER',
      type: 'Bulker',
      flag: 'Panama',
      loa: 225,
      beam: 32.2,
      draft: 13.8,
      maxDraft: 14.2,
      grt: 43500,
      dwt: 82000
    },
    eta: '2026-06-02T08:00:00Z',
    etd: '2026-06-05T18:00:00Z',
    ata: '2026-06-02T07:45:00Z',
    status: 'Working Cargo',
    berthId: 'berth-1',
    agentName: 'Capt. Sarah Jenkins (Maritech)',
    cargoType: 'Iron Ore',
    cargoQty: 75000,
    cargoLoaded: 52000,
    cargoTarget: 75000,
    sofEvents: [
      {
        id: 'sof-1-1',
        timestamp: '2026-06-02T07:45:00Z',
        description: 'Vessel arrived at pilot station',
        category: 'Navigation',
        loggedBy: 'System',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-1-2',
        timestamp: '2026-06-02T08:15:00Z',
        description: 'Pilot onboard',
        category: 'Navigation',
        loggedBy: 'Agent Sarah',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-1-3',
        timestamp: '2026-06-02T09:40:00Z',
        description: 'First line ashore at North Quay 1',
        category: 'Navigation',
        loggedBy: 'Berth Master',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-1-4',
        timestamp: '2026-06-02T10:15:00Z',
        description: 'Vessel all fast, pilot off',
        category: 'Navigation',
        loggedBy: 'Agent Sarah',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-1-5',
        timestamp: '2026-06-02T11:00:00Z',
        description: 'Customs and immigration cleared',
        category: 'Administrative',
        loggedBy: 'Immigration Office',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-1-6',
        timestamp: '2026-06-02T12:00:00Z',
        description: 'Notice of Readiness (NOR) tendered',
        category: 'Administrative',
        loggedBy: 'Capt. Ocean Voyager',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-1-7',
        timestamp: '2026-06-02T13:00:00Z',
        description: 'Laytime commenced',
        category: 'Administrative',
        loggedBy: 'System',
        laytimeImpact: 'Full'
      },
      {
        id: 'sof-1-8',
        timestamp: '2026-06-02T13:30:00Z',
        description: 'Cargo loading commenced (Hatch 2 & 4)',
        category: 'Cargo',
        loggedBy: 'Stevedore Supervisor',
        laytimeImpact: 'Full'
      },
      {
        id: 'sof-1-9',
        timestamp: '2026-06-03T14:00:00Z',
        description: 'Heavy rain - Cargo operations suspended',
        category: 'Delay',
        loggedBy: 'Stevedore Supervisor',
        isDelay: true,
        delayReason: 'Inclement weather - rain',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-1-10',
        timestamp: '2026-06-03T18:30:00Z',
        description: 'Rain stopped - Cargo operations resumed',
        category: 'Cargo',
        loggedBy: 'Stevedore Supervisor',
        laytimeImpact: 'Full'
      },
      {
        id: 'sof-1-11',
        timestamp: '2026-06-04T02:00:00Z',
        description: 'Crane #2 hydraulic leak - loading restricted',
        category: 'Delay',
        loggedBy: 'Terminal Tech',
        isDelay: true,
        delayReason: 'Equipment breakdown - Crane #2',
        laytimeImpact: 'Half'
      },
      {
        id: 'sof-1-12',
        timestamp: '2026-06-04T05:00:00Z',
        description: 'Crane #2 repaired - fully operational',
        category: 'Cargo',
        loggedBy: 'Terminal Tech',
        laytimeImpact: 'Full'
      }
    ],
    services: [
      {
        id: 'srv-1-1',
        name: 'Inward Pilotage',
        category: 'Pilotage',
        status: 'Completed',
        scheduledTime: '2026-06-02T08:00:00Z',
        actualStartTime: '2026-06-02T08:15:00Z',
        actualEndTime: '2026-06-02T10:15:00Z',
        assignedOperator: 'Port Authority Pilots'
      },
      {
        id: 'srv-1-2',
        name: 'Harbor Tugs (Alpha & Beta)',
        category: 'Tugs',
        status: 'Completed',
        scheduledTime: '2026-06-02T08:30:00Z',
        actualStartTime: '2026-06-02T08:45:00Z',
        actualEndTime: '2026-06-02T10:00:00Z',
        assignedOperator: 'Apex Tug Co.'
      },
      {
        id: 'srv-1-3',
        name: 'Fresh Water Supply (150MT)',
        category: 'Provisioning',
        status: 'Completed',
        scheduledTime: '2026-06-03T09:00:00Z',
        actualStartTime: '2026-06-03T09:15:00Z',
        actualEndTime: '2026-06-03T13:45:00Z',
        assignedOperator: 'AquaPort Services'
      },
      {
        id: 'srv-1-4',
        name: 'Bunkering (VLSFO 500MT)',
        category: 'Bunkering',
        status: 'Active',
        scheduledTime: '2026-06-04T12:00:00Z',
        actualStartTime: '2026-06-04T13:00:00Z',
        assignedOperator: 'Marine Fuel Corp',
        notes: 'Barge "BunkerQueen" alongside'
      },
      {
        id: 'srv-1-5',
        name: 'Outward Pilotage',
        category: 'Pilotage',
        status: 'Scheduled',
        scheduledTime: '2026-06-05T18:00:00Z',
        assignedOperator: 'Port Authority Pilots'
      },
      {
        id: 'srv-1-6',
        name: 'Harbor Tugs (Gamma)',
        category: 'Tugs',
        status: 'Scheduled',
        scheduledTime: '2026-06-05T18:15:00Z',
        assignedOperator: 'Apex Tug Co.'
      }
    ]
  },
  {
    id: 'pc-2',
    vessel: {
      imo: '9673989',
      name: 'PACIFIC EMERALD',
      type: 'Tanker',
      flag: 'Singapore',
      loa: 245,
      beam: 42.0,
      draft: 15.2,
      maxDraft: 16.5,
      grt: 62000,
      dwt: 110000
    },
    eta: '2026-06-03T22:30:00Z',
    etd: '2026-06-06T12:00:00Z',
    ata: '2026-06-03T23:05:00Z',
    status: 'Anchored',
    agentName: 'Marcus Vance (InterShip)',
    cargoType: 'Crude Oil',
    cargoQty: 95000,
    cargoLoaded: 0,
    cargoTarget: 95000,
    sofEvents: [
      {
        id: 'sof-2-1',
        timestamp: '2026-06-03T23:05:00Z',
        description: 'Vessel arrived at Port Outer Anchorage',
        category: 'Navigation',
        loggedBy: 'VTS Operator',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-2-2',
        timestamp: '2026-06-04T00:15:00Z',
        description: 'Anchor dropped, anchor watch established',
        category: 'Navigation',
        loggedBy: 'Capt. Pacific Emerald',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-2-3',
        timestamp: '2026-06-04T06:00:00Z',
        description: 'Notice of Readiness (NOR) tendered via email',
        category: 'Administrative',
        loggedBy: 'Agent Marcus',
        laytimeImpact: 'Excluded'
      }
    ],
    services: [
      {
        id: 'srv-2-1',
        name: 'Pilotage to South Pier',
        category: 'Pilotage',
        status: 'Scheduled',
        scheduledTime: '2026-06-05T04:00:00Z',
        assignedOperator: 'Port Authority Pilots',
        notes: 'Subject to berth clearing (South Pier occupied/delayed)'
      },
      {
        id: 'srv-2-2',
        name: 'Harbor Tugs (Alpha, Beta, Delta)',
        category: 'Tugs',
        status: 'Scheduled',
        scheduledTime: '2026-06-05T04:30:00Z',
        assignedOperator: 'Apex Tug Co.'
      }
    ]
  },
  {
    id: 'pc-3',
    vessel: {
      imo: '9822451',
      name: 'MAERSK ADRIATIC',
      type: 'Container',
      flag: 'Denmark',
      loa: 335,
      beam: 48.5,
      draft: 14.1,
      maxDraft: 15.8,
      grt: 112000,
      dwt: 125000
    },
    eta: '2026-06-04T13:00:00Z',
    etd: '2026-06-06T06:00:00Z',
    ata: '2026-06-04T13:40:00Z',
    status: 'Berthing',
    berthId: 'berth-4',
    agentName: 'Tina Rostova (Maersk Line)',
    cargoType: 'Containers',
    cargoQty: 4200, // TEUs
    cargoLoaded: 250,
    cargoTarget: 4200,
    sofEvents: [
      {
        id: 'sof-3-1',
        timestamp: '2026-06-04T13:40:00Z',
        description: 'Arrived pilot station',
        category: 'Navigation',
        loggedBy: 'VTS Operator',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-3-2',
        timestamp: '2026-06-04T14:10:00Z',
        description: 'Pilot onboard Maersk Adriatic',
        category: 'Navigation',
        loggedBy: 'Agent Tina',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-3-3',
        timestamp: '2026-06-04T15:20:00Z',
        description: 'First tug secured',
        category: 'Service',
        loggedBy: 'Tug Alpha Skipper',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-3-4',
        timestamp: '2026-06-04T16:05:00Z',
        description: 'Vessel approaching Container Terminal A',
        category: 'Navigation',
        loggedBy: 'Berth Master',
        laytimeImpact: 'Excluded'
      }
    ],
    services: [
      {
        id: 'srv-3-1',
        name: 'Inward Pilotage',
        category: 'Pilotage',
        status: 'Active',
        scheduledTime: '2026-06-04T13:00:00Z',
        actualStartTime: '2026-06-04T14:10:00Z',
        assignedOperator: 'Port Authority Pilots'
      },
      {
        id: 'srv-3-2',
        name: 'Tug Assistance (Tug Alpha & Omega)',
        category: 'Tugs',
        status: 'Active',
        scheduledTime: '2026-06-04T14:00:00Z',
        actualStartTime: '2026-06-04T15:20:00Z',
        assignedOperator: 'Apex Tug Co.'
      },
      {
        id: 'srv-3-3',
        name: 'Mooring Crew',
        category: 'Mooring',
        status: 'Mobilizing',
        scheduledTime: '2026-06-04T16:15:00Z',
        assignedOperator: 'Terminal Moorings Inc'
      },
      {
        id: 'srv-3-4',
        name: 'Sludge / Waste Disposal',
        category: 'Waste',
        status: 'Scheduled',
        scheduledTime: '2026-06-05T08:00:00Z',
        assignedOperator: 'EcoPort Waste'
      }
    ]
  },
  {
    id: 'pc-4',
    vessel: {
      imo: '9710344',
      name: 'ATLANTIC HORIZON',
      type: 'RoRo',
      flag: 'Bahamas',
      loa: 199,
      beam: 32.2,
      draft: 8.8,
      maxDraft: 9.5,
      grt: 28000,
      dwt: 12500
    },
    eta: '2026-06-04T20:30:00Z',
    etd: '2026-06-05T12:00:00Z',
    status: 'In Transit',
    agentName: 'Marcus Vance (InterShip)',
    cargoType: 'Vehicles',
    cargoQty: 1800, // units
    cargoLoaded: 0,
    cargoTarget: 1800,
    sofEvents: [],
    services: [
      {
        id: 'srv-4-1',
        name: 'Inward Pilotage',
        category: 'Pilotage',
        status: 'Scheduled',
        scheduledTime: '2026-06-04T20:30:00Z',
        assignedOperator: 'Port Authority Pilots'
      },
      {
        id: 'srv-4-2',
        name: 'Tug Assistance (Tug Beta)',
        category: 'Tugs',
        status: 'Scheduled',
        scheduledTime: '2026-06-04T21:00:00Z',
        assignedOperator: 'Apex Tug Co.'
      }
    ]
  },
  {
    id: 'pc-5',
    vessel: {
      imo: '9211054',
      name: 'GALAXY TRADER',
      type: 'General Cargo',
      flag: 'Liberia',
      loa: 160,
      beam: 25.0,
      draft: 8.2,
      maxDraft: 9.8,
      grt: 12400,
      dwt: 18500
    },
    eta: '2026-05-30T10:00:00Z',
    etd: '2026-06-03T16:00:00Z',
    ata: '2026-05-30T10:30:00Z',
    atd: '2026-06-03T15:45:00Z',
    status: 'Departed',
    agentName: 'Tina Rostova (Maersk Line)',
    cargoType: 'Steel Coils & Timber',
    cargoQty: 12000,
    cargoLoaded: 12000,
    cargoTarget: 12000,
    sofEvents: [
      {
        id: 'sof-5-1',
        timestamp: '2026-05-30T10:30:00Z',
        description: 'Vessel arrived at Port Entrance',
        category: 'Navigation',
        loggedBy: 'System',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-5-2',
        timestamp: '2026-05-30T11:00:00Z',
        description: 'Pilot onboard',
        category: 'Navigation',
        loggedBy: 'Agent Tina',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-5-3',
        timestamp: '2026-05-30T12:00:00Z',
        description: 'All fast at North Quay 2',
        category: 'Navigation',
        loggedBy: 'Berth Master',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-5-4',
        timestamp: '2026-05-30T13:00:00Z',
        description: 'Notice of Readiness tendered and accepted',
        category: 'Administrative',
        loggedBy: 'Capt. Galaxy Trader',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-5-5',
        timestamp: '2026-05-30T14:00:00Z',
        description: 'Laytime commenced',
        category: 'Administrative',
        loggedBy: 'System',
        laytimeImpact: 'Full'
      },
      {
        id: 'sof-5-6',
        timestamp: '2026-05-30T14:30:00Z',
        description: 'Discharging commenced (Hold 1 & 3)',
        category: 'Cargo',
        loggedBy: 'Stevedore Supervisor',
        laytimeImpact: 'Full'
      },
      {
        id: 'sof-5-7',
        timestamp: '2026-06-01T08:00:00Z',
        description: 'Stevedore strike - no cargo operations',
        category: 'Delay',
        loggedBy: 'Port Admin',
        isDelay: true,
        delayReason: 'Labor dispute - Stevedore strike',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-5-8',
        timestamp: '2026-06-01T20:00:00Z',
        description: 'Strike ended, loading resumed',
        category: 'Cargo',
        loggedBy: 'Stevedore Supervisor',
        laytimeImpact: 'Full'
      },
      {
        id: 'sof-5-9',
        timestamp: '2026-06-03T11:00:00Z',
        description: 'Cargo operations fully completed',
        category: 'Cargo',
        loggedBy: 'Stevedore Supervisor',
        laytimeImpact: 'Full'
      },
      {
        id: 'sof-5-10',
        timestamp: '2026-06-03T12:00:00Z',
        description: 'Customs cleared & departure documents signed',
        category: 'Administrative',
        loggedBy: 'Agent Tina',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-5-11',
        timestamp: '2026-06-03T14:45:00Z',
        description: 'Pilot onboard for outward transit',
        category: 'Navigation',
        loggedBy: 'Agent Tina',
        laytimeImpact: 'Excluded'
      },
      {
        id: 'sof-5-12',
        timestamp: '2026-06-03T15:45:00Z',
        description: 'Vessel unberthed and cleared port waters',
        category: 'Navigation',
        loggedBy: 'VTS Operator',
        laytimeImpact: 'Excluded'
      }
    ],
    services: [
      {
        id: 'srv-5-1',
        name: 'Inward Pilotage',
        category: 'Pilotage',
        status: 'Completed',
        scheduledTime: '2026-05-30T10:00:00Z',
        actualStartTime: '2026-05-30T11:00:00Z',
        actualEndTime: '2026-05-30T12:15:00Z',
        assignedOperator: 'Port Authority Pilots'
      },
      {
        id: 'srv-5-2',
        name: 'Harbor Tugs (Beta)',
        category: 'Tugs',
        status: 'Completed',
        scheduledTime: '2026-05-30T10:30:00Z',
        actualStartTime: '2026-05-30T11:15:00Z',
        actualEndTime: '2026-05-30T12:05:00Z',
        assignedOperator: 'Apex Tug Co.'
      },
      {
        id: 'srv-5-3',
        name: 'Outward Pilotage',
        category: 'Pilotage',
        status: 'Completed',
        scheduledTime: '2026-06-03T14:30:00Z',
        actualStartTime: '2026-06-03T14:45:00Z',
        actualEndTime: '2026-06-03T15:45:00Z',
        assignedOperator: 'Port Authority Pilots'
      }
    ]
  }
];

export const mockLaytimeCalculations = [
  {
    id: 'ltc-5',
    portCallId: 'pc-5',
    allowedLaytimeHours: 72, // 3 days
    demurrageRate: 15000, // $15,000 / day
    despatchRate: 7500, // $7,500 / day
    laytimeStart: '2026-05-30T14:00:00Z',
    laytimeEnd: '2026-06-03T11:00:00Z'
  }
];
