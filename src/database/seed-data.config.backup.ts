import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

/**
 * Pre-generated ObjectIds untuk memastikan referensi yang konsisten
 * Semua ID di-generate di sini untuk digunakan across all entities
 */
export const SEED_IDS = {
    // Companies
    companies: {
        tekMaju: new Types.ObjectId('673a1234567890abcdef0001'),
        solusiDigital: new Types.ObjectId('673a1234567890abcdef0002'),
    },

    // Positions
    positions: {
        // TekMaju positions
        projectManager: new Types.ObjectId('673a1234567890abcdef0011'),
        fieldEngineer: new Types.ObjectId('673a1234567890abcdef0012'),
        technician: new Types.ObjectId('673a1234567890abcdef0013'),
        // SolusiDigital positions
        itConsultant: new Types.ObjectId('673a1234567890abcdef0014'),
        developer: new Types.ObjectId('673a1234567890abcdef0015'),
    },

    // Users
    users: {
        // Admin
        admin: new Types.ObjectId('673a1234567890abcdef0021'),
        // TekMaju users
        ownerTekMaju: new Types.ObjectId('673a1234567890abcdef0022'),
        managerTekMaju: new Types.ObjectId('673a1234567890abcdef0023'),
        staff1TekMaju: new Types.ObjectId('673a1234567890abcdef0024'),
        staff2TekMaju: new Types.ObjectId('673a1234567890abcdef0025'),
        // SolusiDigital users
        ownerSolusi: new Types.ObjectId('673a1234567890abcdef0026'),
        managerSolusi: new Types.ObjectId('673a1234567890abcdef0027'),
        staffSolusi: new Types.ObjectId('673a1234567890abcdef0028'),
        // Unassigned Staff
        freelancer1: new Types.ObjectId('673a1234567890abcdef0029'),
        freelancer2: new Types.ObjectId('673a1234567890abcdef002a'),
    },

    // Form Templates
    forms: {
        clientIntakeGeneral: 'form_client_intake_general',
        siteInspection: 'form_site_inspection',
        installation: 'form_installation',
        workReport: 'form_work_report',
        qualityCheck: 'form_quality_check',
    },

    // Services
    services: {
        networkSetup: new Types.ObjectId('673a1234567890abcdef0031'),
        maintenance: new Types.ObjectId('673a1234567890abcdef0032'),
    },

    // Client Service Requests
    csrs: {
        csr1: new Types.ObjectId('673a1234567890abcdef0041'),
        csr2: new Types.ObjectId('673a1234567890abcdef0042'),
    },

    // Work Orders
    workOrders: {
        wo1: new Types.ObjectId('673a1234567890abcdef0051'),
        wo2: new Types.ObjectId('673a1234567890abcdef0052'),
    },

    // Form Submissions
    submissions: {
        intake1: new Types.ObjectId('673a1234567890abcdef0061'),
        inspection1: new Types.ObjectId('673a1234567890abcdef0062'),
    },

    // Work Reports
    reports: {
        report1: new Types.ObjectId('673a1234567890abcdef0071'),
    },

    // Membership Codes
    memberships: {
        code1: new Types.ObjectId('673a1234567890abcdef0081'),
        code2: new Types.ObjectId('673a1234567890abcdef0082'),
    },
};

/**
 * Configuration object untuk semua seed data
 */
export const SeedDataConfig = {
    // ============================================
    // 1. COMPANIES
    // ============================================
    companies: [
        {
            _id: SEED_IDS.companies.tekMaju,
            name: 'TekMaju Engineering',
            address: 'Jl. Teknologi No. 123, Jakarta Selatan',
            description: 'Perusahaan engineering dan konstruksi terpercaya',
            ownerId: SEED_IDS.users.ownerTekMaju,
            managers: [SEED_IDS.users.managerTekMaju],
            staffs: [SEED_IDS.users.staff1TekMaju, SEED_IDS.users.staff2TekMaju],
            isActive: true,
        },
        {
            _id: SEED_IDS.companies.solusiDigital,
            name: 'Solusi Digital Indonesia',
            address: 'Jl. Digital Hub No. 456, Tangerang',
            description: 'Solusi IT dan Digital Transformation',
            ownerId: SEED_IDS.users.ownerSolusi,
            managers: [SEED_IDS.users.managerSolusi],
            staffs: [SEED_IDS.users.staffSolusi],
            isActive: true,
        },
    ],

    // ============================================
    // 2. POSITIONS
    // ============================================
    positions: [
        // TekMaju positions
        {
            _id: SEED_IDS.positions.projectManager,
            name: 'Project Manager',
            description: 'Manages overall project execution',
            companyId: SEED_IDS.companies.tekMaju,
        },
        {
            _id: SEED_IDS.positions.fieldEngineer,
            name: 'Field Engineer',
            description: 'Handles on-site technical work',
            companyId: SEED_IDS.companies.tekMaju,
        },
        {
            _id: SEED_IDS.positions.technician,
            name: 'Technician',
            description: 'Technical support and maintenance',
            companyId: SEED_IDS.companies.tekMaju,
        },
        // SolusiDigital positions
        {
            _id: SEED_IDS.positions.itConsultant,
            name: 'IT Consultant',
            description: 'Provides IT consultation services',
            companyId: SEED_IDS.companies.solusiDigital,
        },
        {
            _id: SEED_IDS.positions.developer,
            name: 'Software Developer',
            description: 'Develops software solutions',
            companyId: SEED_IDS.companies.solusiDigital,
        },
    ],

    // ============================================
    // 3. USERS
    // ============================================
    users: [
        // Admin
        {
            _id: SEED_IDS.users.admin,
            name: 'Admin System',
            email: 'admin@system.com',
            password: bcrypt.hashSync('password123', 10),
            role: 'admin',
            companyId: null,
            positionId: null,
        },
        // TekMaju users
        {
            _id: SEED_IDS.users.ownerTekMaju,
            name: 'Budi Santoso',
            email: 'budi@tekmaju.co.id',
            password: bcrypt.hashSync('password123', 10),
            role: 'owner_company',
            companyId: SEED_IDS.companies.tekMaju,
            positionId: null,
        },
        {
            _id: SEED_IDS.users.managerTekMaju,
            name: 'Siti Nurhaliza',
            email: 'siti@tekmaju.co.id',
            password: bcrypt.hashSync('password123', 10),
            role: 'manager_company',
            companyId: SEED_IDS.companies.tekMaju,
            positionId: null,
        },
        {
            _id: SEED_IDS.users.staff1TekMaju,
            name: 'Ahmad Rizki',
            email: 'ahmad@tekmaju.co.id',
            password: bcrypt.hashSync('password123', 10),
            role: 'staff_company',
            companyId: SEED_IDS.companies.tekMaju,
            positionId: SEED_IDS.positions.fieldEngineer,
        },
        {
            _id: SEED_IDS.users.staff2TekMaju,
            name: 'Dewi Lestari',
            email: 'dewi@tekmaju.co.id',
            password: bcrypt.hashSync('password123', 10),
            role: 'staff_company',
            companyId: SEED_IDS.companies.tekMaju,
            positionId: SEED_IDS.positions.technician,
        },
        // SolusiDigital users
        {
            _id: SEED_IDS.users.ownerSolusi,
            name: 'Rudi Hartono',
            email: 'rudi@solusidigital.id',
            password: bcrypt.hashSync('password123', 10),
            role: 'owner_company',
            companyId: SEED_IDS.companies.solusiDigital,
            positionId: null,
        },
        {
            _id: SEED_IDS.users.managerSolusi,
            name: 'Linda Wijaya',
            email: 'linda@solusidigital.id',
            password: bcrypt.hashSync('password123', 10),
            role: 'manager_company',
            companyId: SEED_IDS.companies.solusiDigital,
            positionId: null,
        },
        {
            _id: SEED_IDS.users.staffSolusi,
            name: 'Eko Prasetyo',
            email: 'eko@solusidigital.id',
            password: bcrypt.hashSync('password123', 10),
            role: 'staff_company',
            companyId: SEED_IDS.companies.solusiDigital,
            positionId: SEED_IDS.positions.developer,
        },
        // Freelancers (staff_unassigned)
        {
            _id: SEED_IDS.users.freelancer1,
            name: 'Andi Freelance',
            email: 'andi@freelance.com',
            password: bcrypt.hashSync('password123', 10),
            role: 'staff_unassigned',
            companyId: null,
            positionId: null,
        },
        {
            _id: SEED_IDS.users.freelancer2,
            name: 'Maya Independent',
            email: 'maya@freelance.com',
            password: bcrypt.hashSync('password123', 10),
            role: 'staff_unassigned',
            companyId: null,
            positionId: null,
        },
    ],

    // ============================================
    // 4. FORM TEMPLATES
    // ============================================
    formTemplates: [
        {
            formKey: SEED_IDS.forms.clientIntakeGeneral,
            companyId: SEED_IDS.companies.tekMaju,
            title: 'General Client Intake Form',
            description: 'Initial client information gathering',
            formType: 'intake',
            __v: 0,
            fields: [
                { order: 1, label: 'Client Name', type: 'text', required: true, options: [] },
                { order: 2, label: 'Contact Number', type: 'text', required: true, options: [] },
                { order: 3, label: 'Email Address', type: 'email', required: true, options: [] },
                { order: 4, label: 'Company Name', type: 'text', required: false, options: [] },
                { order: 5, label: 'Type of Service Required', type: 'select', required: true, options: [{ key: 'installation', value: 'Installation' }, { key: 'maintenance', value: 'Maintenance' }, { key: 'consultation', value: 'Consultation' }] },
                { order: 6, label: 'Urgency Level', type: 'select', required: true, options: [{ key: 'low', value: 'Low' }, { key: 'medium', value: 'Medium' }, { key: 'high', value: 'High' }, { key: 'critical', value: 'Critical' }] },
                { order: 7, label: 'Additional Notes', type: 'textarea', required: false, options: [] },
            ],
        },
        {
            formKey: SEED_IDS.forms.siteInspection,
            title: 'Site Inspection Report',
            description: 'On-site inspection documentation',
            formType: 'work_order',
            fields: [
                { order: 1, fieldKey: 'inspection_date', label: 'Inspection Date', fieldType: 'date', required: true, options: [] },
                { order: 2, fieldKey: 'location', label: 'Location', fieldType: 'text', required: true, options: [] },
                { order: 3, fieldKey: 'site_condition', label: 'Site Condition', fieldType: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
                { order: 4, fieldKey: 'access_availability', label: 'Site Access', fieldType: 'select', required: true, options: ['Easy', 'Moderate', 'Difficult'] },
                { order: 5, fieldKey: 'equipment_needed', label: 'Equipment Needed', fieldType: 'textarea', required: true, options: [] },
                { order: 6, fieldKey: 'safety_concerns', label: 'Safety Concerns', fieldType: 'textarea', required: false, options: [] },
                { order: 7, fieldKey: 'photos', label: 'Site Photos', fieldType: 'file', required: false, options: [] },
                { order: 8, fieldKey: 'inspector_signature', label: 'Inspector Signature', fieldType: 'text', required: true, options: [] },
            ],
        },
        {
            formKey: SEED_IDS.forms.installation,
            title: 'Installation Work Form',
            description: 'Installation execution documentation',
            formType: 'work_order',
            fields: [
                { order: 1, fieldKey: 'installation_date', label: 'Installation Date', fieldType: 'date', required: true, options: [] },
                { order: 2, fieldKey: 'equipment_installed', label: 'Equipment Installed', fieldType: 'textarea', required: true, options: [] },
                { order: 3, fieldKey: 'serial_numbers', label: 'Serial Numbers', fieldType: 'textarea', required: true, options: [] },
                { order: 4, fieldKey: 'installation_status', label: 'Installation Status', fieldType: 'select', required: true, options: ['Completed', 'Partial', 'Failed'] },
                { order: 5, fieldKey: 'testing_results', label: 'Testing Results', fieldType: 'select', required: true, options: ['Pass', 'Fail', 'Pending'] },
                { order: 6, fieldKey: 'issues_encountered', label: 'Issues Encountered', fieldType: 'textarea', required: false, options: [] },
                { order: 7, fieldKey: 'technician_notes', label: 'Technician Notes', fieldType: 'textarea', required: false, options: [] },
            ],
        },
        {
            formKey: SEED_IDS.forms.workReport,
            title: 'Work Completion Report',
            description: 'Final work report',
            formType: 'work_report',
            fields: [
                { order: 1, fieldKey: 'completion_date', label: 'Completion Date', fieldType: 'date', required: true, options: [] },
                { order: 2, fieldKey: 'work_summary', label: 'Work Summary', fieldType: 'textarea', required: true, options: [] },
                { order: 3, fieldKey: 'hours_worked', label: 'Total Hours Worked', fieldType: 'number', required: true, options: [] },
                { order: 4, fieldKey: 'materials_used', label: 'Materials Used', fieldType: 'textarea', required: true, options: [] },
                { order: 5, fieldKey: 'client_feedback', label: 'Client Feedback', fieldType: 'textarea', required: false, options: [] },
                { order: 6, fieldKey: 'follow_up_required', label: 'Follow-up Required', fieldType: 'select', required: true, options: ['Yes', 'No'] },
            ],
        },
        {
            formKey: SEED_IDS.forms.qualityCheck,
            title: 'Quality Assurance Check',
            description: 'Quality control verification',
            formType: 'work_order',
            fields: [
                { order: 1, fieldKey: 'qa_date', label: 'QA Date', fieldType: 'date', required: true, options: [] },
                { order: 2, fieldKey: 'checklist_completed', label: 'All Checklist Items Completed', fieldType: 'select', required: true, options: ['Yes', 'No'] },
                { order: 3, fieldKey: 'quality_rating', label: 'Quality Rating', fieldType: 'select', required: true, options: ['Excellent', 'Good', 'Acceptable', 'Needs Improvement'] },
                { order: 4, fieldKey: 'defects_found', label: 'Defects Found', fieldType: 'textarea', required: false, options: [] },
                { order: 5, fieldKey: 'corrective_actions', label: 'Corrective Actions Taken', fieldType: 'textarea', required: false, options: [] },
                { order: 6, fieldKey: 'approved_by', label: 'Approved By', fieldType: 'text', required: true, options: [] },
            ],
        },
    ],

    // ============================================
    // 5. SERVICES
    // ============================================
    services: [
        {
            _id: SEED_IDS.services.networkSetup,
            serviceKey: 'service_network_setup',
            companyId: SEED_IDS.companies.tekMaju,
            title: 'Network Infrastructure Setup',
            description: 'Complete network installation and configuration services',
            requiredStaffs: [
                {
                    positionId: SEED_IDS.positions.fieldEngineer,
                    minimumStaff: 1,
                    maximumStaff: 2,
                },
                {
                    positionId: SEED_IDS.positions.technician,
                    minimumStaff: 1,
                    maximumStaff: 3,
                },
            ],
            clientIntake: [
                {
                    order: 1,
                    formKey: SEED_IDS.forms.clientIntakeGeneral,
                    fillableByRoles: ['owner_company', 'manager_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [],
                    viewableByPositionIds: [],
                },
            ],
            workOrderForms: [
                {
                    order: 1,
                    formKey: SEED_IDS.forms.siteInspection,
                    fillableByRoles: ['staff_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [SEED_IDS.positions.fieldEngineer],
                    viewableByPositionIds: [SEED_IDS.positions.fieldEngineer, SEED_IDS.positions.technician],
                },
                {
                    order: 2,
                    formKey: SEED_IDS.forms.installation,
                    fillableByRoles: ['staff_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [SEED_IDS.positions.fieldEngineer, SEED_IDS.positions.technician],
                    viewableByPositionIds: [SEED_IDS.positions.fieldEngineer, SEED_IDS.positions.technician],
                },
                {
                    order: 3,
                    formKey: SEED_IDS.forms.qualityCheck,
                    fillableByRoles: ['manager_company', 'staff_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [SEED_IDS.positions.projectManager],
                    viewableByPositionIds: [],
                },
            ],
            workReportForms: [
                {
                    order: 1,
                    formKey: SEED_IDS.forms.workReport,
                    fillableByRoles: ['staff_company', 'manager_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [],
                    viewableByPositionIds: [],
                },
            ],
        },
        {
            _id: SEED_IDS.services.maintenance,
            serviceKey: 'service_maintenance',
            companyId: SEED_IDS.companies.tekMaju,
            title: 'Regular Maintenance Service',
            description: 'Scheduled maintenance and troubleshooting',
            requiredStaffs: [
                {
                    positionId: SEED_IDS.positions.technician,
                    minimumStaff: 1,
                    maximumStaff: 2,
                },
            ],
            clientIntake: [
                {
                    order: 1,
                    formKey: SEED_IDS.forms.clientIntakeGeneral,
                    fillableByRoles: ['owner_company', 'manager_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [],
                    viewableByPositionIds: [],
                },
            ],
            workOrderForms: [
                {
                    order: 1,
                    formKey: SEED_IDS.forms.installation,
                    fillableByRoles: ['staff_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [SEED_IDS.positions.technician],
                    viewableByPositionIds: [SEED_IDS.positions.technician],
                },
            ],
            workReportForms: [
                {
                    order: 1,
                    formKey: SEED_IDS.forms.workReport,
                    fillableByRoles: ['staff_company'],
                    viewableByRoles: ['owner_company', 'manager_company', 'staff_company'],
                    fillableByPositionIds: [],
                    viewableByPositionIds: [],
                },
            ],
        },
    ],

    // ============================================
    // 6. MEMBERSHIP CODES
    // ============================================
    membershipCodes: [
        {
            _id: SEED_IDS.memberships.code1,
            code: 'TEKMAJU2024',
            isClaimed: false,
            claimedBy: null,
            claimedAt: null,
        },
        {
            _id: SEED_IDS.memberships.code2,
            code: 'SOLUSI2024',
            isClaimed: false,
            claimedBy: null,
            claimedAt: null,
        },
    ],
};
