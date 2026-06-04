export interface Vessel {
  imo: string;
  name: string;
  type: 'Bulker' | 'Tanker' | 'Container' | 'LNG' | 'RoRo' | 'General Cargo';
  flag: string;
  loa: number; // Length Over All in meters
  beam: number; // Width in meters
  draft: number; // Current draft in meters
  maxDraft: number; // Max draft in meters
  grt: number; // Gross Register Tonnage
  dwt: number; // Deadweight Tonnage
}

export interface SOFEvent {
  id: string;
  timestamp: string;
  description: string;
  category: 'Navigation' | 'Cargo' | 'Service' | 'Administrative' | 'Delay';
  loggedBy: string;
  isDelay?: boolean;
  delayReason?: string;
  laytimeImpact: 'Full' | 'Excluded' | 'Half'; // How it affects laytime calculations
}

export interface ServiceTask {
  id: string;
  name: string;
  category: 'Pilotage' | 'Tugs' | 'Mooring' | 'Bunkering' | 'Customs' | 'Provisioning' | 'Waste';
  status: 'Scheduled' | 'Mobilizing' | 'Active' | 'Completed' | 'Delayed';
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  assignedOperator: string;
  notes?: string;
}

export interface PortCall {
  id: string;
  vessel: Vessel;
  eta: string;
  etd: string;
  ata?: string; // Actual Time of Arrival
  atd?: string; // Actual Time of Departure
  status: 'In Transit' | 'Anchored' | 'Berthing' | 'Working Cargo' | 'Departing' | 'Departed';
  berthId?: string; // Occupied berth
  agentName: string;
  cargoType: string;
  cargoQty: number; // e.g. metric tons or TEUs
  cargoLoaded: number;
  cargoTarget: number;
  sofEvents: SOFEvent[];
  services: ServiceTask[];
}

export interface Berth {
  id: string;
  name: string;
  terminal: string;
  length: number; // Max LOA allowed in meters
  depth: number; // Max draft allowed in meters
  occupiedVesselId?: string;
}

export interface LaytimeCalculation {
  id: string;
  portCallId: string;
  allowedLaytimeHours: number; // total allowed hours
  demurrageRate: number; // USD per day
  despatchRate: number; // USD per day
  laytimeStart: string; // ISO string
  laytimeEnd: string; // ISO string
}
