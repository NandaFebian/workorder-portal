export const BASE_URL = __ENV.BASE_URL || 'https://workorder-production.up.railway.app';

export const CSV_PATH = './data/users.csv';

export const THRESHOLDS = {
  http_req_duration: ['p(95)<3000', 'p(99)<5000'],
  http_req_failed: ['rate<0.02'],
};

export const AUTH = {
  owner: {
    name: 'Stress Owner',
    email: 'stress-owner@test.com',
    password: 'StressTest123!',
    companyName: 'Stress Test Corp',
  },
  manager: {
    name: 'Stress Manager',
    email: 'stress-manager@test.com',
    password: 'StressTest123!',
  },
  staff1: {
    name: 'Stress Staff 1',
    email: 'stress-staff1@test.com',
    password: 'StressTest123!',
  },
  staff2: {
    name: 'Stress Staff 2',
    email: 'stress-staff2@test.com',
    password: 'StressTest123!',
  },
};

export const PERIOD_TYPES = ['daily', 'weekly', 'monthly', 'yearly'];
