/**
 * Data Seeding Script - Work Order Portal
 * Creates minimum 5 dummy data entries for each endpoint
 */

const BASE_URL = 'http://localhost:3000';

// Storage for created IDs
const createdData = {
    owners: [],
    companies: [],
    positions: [],
    forms: {
        intake: [],
        workOrder: [],
        report: []
    },
    services: [],
    clients: [],
    unassignedStaff: [],
    clientServiceRequests: [],
    workOrders: [],
    membershipCodes: [],
    workReports: []
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();
        return { status: response.status, data: result };
    } catch (error) {
        console.error(`Error: ${method} ${endpoint}`, error.message);
        return { status: 500, error: error.message };
    }
}

// Extract token from response
function extractToken(response) {
    if (response.data?.data?.token) {
        return response.data.data.token.replace('Bearer ', '');
    }
    return null;
}

// 1. Create Company Owners & Companies
async function seedCompanies() {
    console.log('\n=== SEEDING COMPANIES & OWNERS ===');

    const companies = [
        { name: 'PT Teknologi Nusantara', owner: 'Jane Smith', email: 'jane.smith@teknologi.com' },
        { name: 'PT Digital Inovasi', owner: 'Robert Chen', email: 'robert.chen@digital.com' },
        { name: 'PT Solusi Kreatif', owner: 'Sarah Johnson', email: 'sarah.j@solusi.com' },
        { name: 'PT Maju Bersama', owner: 'Ahmad Rizki', email: 'ahmad.rizki@maju.com' },
        { name: 'PT Karya Mandiri', owner: 'Dewi Lestari', email: 'dewi.lestari@karya.com' }
    ];

    for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        const result = await apiCall('POST', '/auth/register-company', {
            name: company.owner,
            email: company.email,
            password: 'password123',
            companyName: company.name
        });

        if (result.status === 201 || result.status === 200) {
            const ownerId = result.data.data?.user?._id || result.data.user?._id;
            const companyId = result.data.data?.company?._id || result.data.company?._id;

            createdData.owners.push({ id: ownerId, email: company.email, name: company.owner });
            createdData.companies.push({ id: companyId, name: company.name, ownerId });

            console.log(`✓ Created: ${company.name} (Owner: ${company.owner})`);
        } else {
            console.log(`✗ Failed to create ${company.name}: ${result.data?.message || 'Unknown error'}`);
        }
    }
}

// 2. Create Positions for each company
async function seedPositions() {
    console.log('\n=== SEEDING POSITIONS ===');

    const positionTemplates = [
        { name: 'Software Engineer', description: 'Mengembangkan dan memelihara aplikasi' },
        { name: 'Project Manager', description: 'Mengelola proyek dan koordinasi tim' },
        { name: 'Quality Assurance', description: 'Testing dan quality control' },
        { name: 'UI/UX Designer', description: 'Merancang antarmuka dan pengalaman pengguna' },
        { name: 'DevOps Engineer', description: 'Mengelola infrastruktur dan deployment' },
        { name: 'Business Analyst', description: 'Analisis kebutuhan bisnis' },
        { name: 'Technical Writer', description: 'Membuat dokumentasi teknis' }
    ];

    for (const owner of createdData.owners) {
        // Login as owner
        const loginResult = await apiCall('POST', '/auth/login', {
            email: owner.email,
            password: 'password123'
        });

        const token = extractToken(loginResult);
        if (!token) continue;

        // Create 5-7 positions per company
        const numPositions = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numPositions; i++) {
            const template = positionTemplates[i % positionTemplates.length];
            const result = await apiCall('POST', '/positions', {
                name: template.name,
                description: template.description,
                isActive: true
            }, token);

            if (result.status === 201 || result.status === 200) {
                const positionId = result.data.data?._id || result.data._id;
                createdData.positions.push({
                    id: positionId,
                    name: template.name,
                    companyId: createdData.companies.find(c => c.ownerId === owner.id)?.id
                });
                console.log(`✓ Created position: ${template.name} for ${owner.name}`);
            }
        }
    }
}

// 3. Create Form Templates
async function seedForms() {
    console.log('\n=== SEEDING FORM TEMPLATES ===');

    const intakeForms = [
        {
            title: 'Formulir Permintaan Website',
            description: 'Form untuk permintaan pembuatan website',
            fields: [
                { order: 1, label: 'Nama Perusahaan', type: 'text', required: true },
                { order: 2, label: 'Email', type: 'email', required: true },
                {
                    order: 3, label: 'Jenis Website', type: 'select', required: true, options: [
                        { key: 'corporate', value: 'Corporate Website' },
                        { key: 'ecommerce', value: 'E-Commerce' }
                    ]
                },
                { order: 4, label: 'Budget', type: 'number', required: true, min: 10, max: 1000 }
            ]
        },
        {
            title: 'Formulir Permintaan Mobile App',
            description: 'Form untuk permintaan pembuatan aplikasi mobile',
            fields: [
                { order: 1, label: 'Nama Aplikasi', type: 'text', required: true },
                {
                    order: 2, label: 'Platform', type: 'select', required: true, options: [
                        { key: 'android', value: 'Android' },
                        { key: 'ios', value: 'iOS' },
                        { key: 'both', value: 'Android & iOS' }
                    ]
                },
                { order: 3, label: 'Deskripsi Fitur', type: 'textarea', required: true }
            ]
        },
        {
            title: 'Formulir Konsultasi IT',
            description: 'Form untuk permintaan konsultasi IT',
            fields: [
                { order: 1, label: 'Topik Konsultasi', type: 'text', required: true },
                { order: 2, label: 'Detail Masalah', type: 'textarea', required: true },
                {
                    order: 3, label: 'Tingkat Urgensi', type: 'select', required: true, options: [
                        { key: 'low', value: 'Rendah' },
                        { key: 'medium', value: 'Sedang' },
                        { key: 'high', value: 'Tinggi' }
                    ]
                }
            ]
        },
        {
            title: 'Formulir Maintenance System',
            description: 'Form untuk permintaan maintenance sistem',
            fields: [
                { order: 1, label: 'Nama Sistem', type: 'text', required: true },
                {
                    order: 2, label: 'Jenis Maintenance', type: 'select', required: true, options: [
                        { key: 'preventive', value: 'Preventive' },
                        { key: 'corrective', value: 'Corrective' }
                    ]
                },
                { order: 3, label: 'Jadwal yang Diinginkan', type: 'date', required: true }
            ]
        },
        {
            title: 'Formulir Training Request',
            description: 'Form untuk permintaan pelatihan',
            fields: [
                { order: 1, label: 'Topik Training', type: 'text', required: true },
                { order: 2, label: 'Jumlah Peserta', type: 'number', required: true, min: 1, max: 50 },
                { order: 3, label: 'Durasi (hari)', type: 'number', required: true, min: 1, max: 30 }
            ]
        }
    ];

    const workOrderForms = [
        {
            title: 'Work Order - Development',
            fields: [
                { order: 1, label: 'Task Description', type: 'textarea', required: true },
                { order: 2, label: 'Progress (%)', type: 'number', required: true, min: 0, max: 100 },
                { order: 3, label: 'Estimated Hours', type: 'number', required: true }
            ]
        },
        {
            title: 'Work Order - Design',
            fields: [
                { order: 1, label: 'Design Scope', type: 'textarea', required: true },
                {
                    order: 2, label: 'Completion Status', type: 'select', required: true, options: [
                        { key: 'not_started', value: 'Not Started' },
                        { key: 'in_progress', value: 'In Progress' },
                        { key: 'completed', value: 'Completed' }
                    ]
                }
            ]
        },
        {
            title: 'Work Order - Testing',
            fields: [
                { order: 1, label: 'Test Cases', type: 'textarea', required: true },
                { order: 2, label: 'Bugs Found', type: 'number', required: true, min: 0 },
                { order: 3, label: 'Test Status', type: 'text', required: true }
            ]
        },
        {
            title: 'Work Order - Deployment',
            fields: [
                { order: 1, label: 'Deployment Notes', type: 'textarea', required: true },
                {
                    order: 2, label: 'Environment', type: 'select', required: true, options: [
                        { key: 'dev', value: 'Development' },
                        { key: 'staging', value: 'Staging' },
                        { key: 'prod', value: 'Production' }
                    ]
                }
            ]
        },
        {
            title: 'Work Order - Maintenance',
            fields: [
                { order: 1, label: 'Maintenance Activity', type: 'textarea', required: true },
                { order: 2, label: 'Downtime Required', type: 'checkbox', required: false }
            ]
        }
    ];

    const reportForms = [
        {
            title: 'Daily Progress Report',
            fields: [
                { order: 1, label: 'Activities Completed', type: 'textarea', required: true },
                { order: 2, label: 'Issues Encountered', type: 'textarea', required: false },
                { order: 3, label: 'Next Steps', type: 'textarea', required: true }
            ]
        },
        {
            title: 'Weekly Summary Report',
            fields: [
                { order: 1, label: 'Week Summary', type: 'textarea', required: true },
                { order: 2, label: 'Achievements', type: 'textarea', required: true },
                { order: 3, label: 'Blockers', type: 'textarea', required: false }
            ]
        },
        {
            title: 'Project Milestone Report',
            fields: [
                { order: 1, label: 'Milestone Name', type: 'text', required: true },
                { order: 2, label: 'Completion Status', type: 'number', required: true, min: 0, max: 100 },
                { order: 3, label: 'Deliverables', type: 'textarea', required: true }
            ]
        },
        {
            title: 'Bug Report',
            fields: [
                { order: 1, label: 'Bug Description', type: 'textarea', required: true },
                {
                    order: 2, label: 'Severity', type: 'select', required: true, options: [
                        { key: 'low', value: 'Low' },
                        { key: 'medium', value: 'Medium' },
                        { key: 'high', value: 'High' },
                        { key: 'critical', value: 'Critical' }
                    ]
                },
                { order: 3, label: 'Steps to Reproduce', type: 'textarea', required: true }
            ]
        },
        {
            title: 'Completion Report',
            fields: [
                { order: 1, label: 'Final Summary', type: 'textarea', required: true },
                { order: 2, label: 'Lessons Learned', type: 'textarea', required: false },
                { order: 3, label: 'Client Feedback', type: 'textarea', required: false }
            ]
        }
    ];

    // Create forms for each company
    for (const owner of createdData.owners) {
        const loginResult = await apiCall('POST', '/auth/login', {
            email: owner.email,
            password: 'password123'
        });

        const token = extractToken(loginResult);
        if (!token) continue;

        // Create Intake Forms
        for (const form of intakeForms) {
            const result = await apiCall('POST', '/forms', {
                title: form.title,
                description: form.description,
                formType: 'intake',
                fields: form.fields
            }, token);

            if (result.status === 201 || result.status === 200) {
                const formId = result.data.data?._id || result.data._id;
                createdData.forms.intake.push({ id: formId, title: form.title, ownerId: owner.id });
                console.log(`✓ Created intake form: ${form.title}`);
            }
        }

        // Create Work Order Forms
        for (const form of workOrderForms) {
            const result = await apiCall('POST', '/forms', {
                title: form.title,
                formType: 'work_order',
                fields: form.fields
            }, token);

            if (result.status === 201 || result.status === 200) {
                const formId = result.data.data?._id || result.data._id;
                createdData.forms.workOrder.push({ id: formId, title: form.title, ownerId: owner.id });
                console.log(`✓ Created work order form: ${form.title}`);
            }
        }

        // Create Report Forms
        for (const form of reportForms) {
            const result = await apiCall('POST', '/forms', {
                title: form.title,
                formType: 'report',
                fields: form.fields
            }, token);

            if (result.status === 201 || result.status === 200) {
                const formId = result.data.data?._id || result.data._id;
                createdData.forms.report.push({ id: formId, title: form.title, ownerId: owner.id });
                console.log(`✓ Created report form: ${form.title}`);
            }
        }
    }
}

// 4. Create Services
async function seedServices() {
    console.log('\n=== SEEDING SERVICES ===');

    const serviceTemplates = [
        { title: 'Website Development', description: 'Layanan pembuatan website profesional', accessType: 'public' },
        { title: 'Mobile App Development', description: 'Layanan pembuatan aplikasi mobile', accessType: 'public' },
        { title: 'IT Consulting', description: 'Konsultasi teknologi informasi', accessType: 'member_only' },
        { title: 'System Maintenance', description: 'Pemeliharaan sistem IT', accessType: 'member_only' },
        { title: 'Cloud Migration', description: 'Migrasi sistem ke cloud', accessType: 'public' },
        { title: 'Data Analytics', description: 'Analisis dan visualisasi data', accessType: 'public' },
        { title: 'Cybersecurity Audit', description: 'Audit keamanan sistem', accessType: 'internal' }
    ];

    for (const owner of createdData.owners) {
        const loginResult = await apiCall('POST', '/auth/login', {
            email: owner.email,
            password: 'password123'
        });

        const token = extractToken(loginResult);
        if (!token) continue;

        // Get positions for this company
        const companyPositions = createdData.positions.filter(p => {
            const company = createdData.companies.find(c => c.ownerId === owner.id);
            return p.companyId === company?.id;
        });

        if (companyPositions.length === 0) continue;

        // Get forms for this owner
        const ownerIntakeForms = createdData.forms.intake.filter(f => f.ownerId === owner.id);
        const ownerWorkOrderForms = createdData.forms.workOrder.filter(f => f.ownerId === owner.id);
        const ownerReportForms = createdData.forms.report.filter(f => f.ownerId === owner.id);

        // Create 5-7 services
        const numServices = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numServices; i++) {
            const template = serviceTemplates[i % serviceTemplates.length];

            const serviceData = {
                title: template.title,
                description: template.description,
                requiredStaffs: [
                    {
                        positionId: companyPositions[0].id,
                        minimumStaff: 1,
                        maximumStaff: 3
                    }
                ],
                accessType: template.accessType,
                isActive: true
            };

            // Add forms if available
            if (ownerIntakeForms.length > 0) {
                serviceData.clientIntakeForms = [{
                    order: 1,
                    formId: ownerIntakeForms[i % ownerIntakeForms.length].id
                }];
            }

            if (ownerWorkOrderForms.length > 0) {
                serviceData.workOrderForms = [{
                    order: 1,
                    formId: ownerWorkOrderForms[i % ownerWorkOrderForms.length].id,
                    fillableByRoles: ['manager_company', 'staff_company'],
                    viewableByRoles: ['manager_company', 'staff_company', 'owner_company']
                }];
            }

            if (ownerReportForms.length > 0) {
                serviceData.reportForms = [{
                    order: 1,
                    formId: ownerReportForms[i % ownerReportForms.length].id,
                    fillableByRoles: ['staff_company'],
                    viewableByRoles: ['manager_company', 'staff_company', 'owner_company']
                }];
            }

            const result = await apiCall('POST', '/services', serviceData, token);

            if (result.status === 201 || result.status === 200) {
                const serviceId = result.data.data?._id || result.data._id;
                createdData.services.push({
                    id: serviceId,
                    title: template.title,
                    ownerId: owner.id
                });
                console.log(`✓ Created service: ${template.title} for ${owner.name}`);
            }
        }
    }
}

// 5. Create Clients
async function seedClients() {
    console.log('\n=== SEEDING CLIENTS ===');

    const clients = [
        { name: 'Alice Wong', email: 'alice.wong@client.com' },
        { name: 'Bob Martinez', email: 'bob.martinez@client.com' },
        { name: 'Charlie Kim', email: 'charlie.kim@client.com' },
        { name: 'Diana Patel', email: 'diana.patel@client.com' },
        { name: 'Edward Lee', email: 'edward.lee@client.com' },
        { name: 'Fiona Chen', email: 'fiona.chen@client.com' },
        { name: 'George Taylor', email: 'george.taylor@client.com' }
    ];

    for (const client of clients) {
        const result = await apiCall('POST', '/auth/register', {
            name: client.name,
            email: client.email,
            password: 'password123',
            role: 'client'
        });

        if (result.status === 201 || result.status === 200) {
            const clientId = result.data.data?.user?._id || result.data.user?._id;
            createdData.clients.push({ id: clientId, name: client.name, email: client.email });
            console.log(`✓ Created client: ${client.name}`);
        }
    }
}

// 6. Generate Membership Codes
async function seedMembershipCodes() {
    console.log('\n=== SEEDING MEMBERSHIP CODES ===');

    for (const owner of createdData.owners.slice(0, 5)) {
        const loginResult = await apiCall('POST', '/auth/login', {
            email: owner.email,
            password: 'password123'
        });

        const token = extractToken(loginResult);
        if (!token) continue;

        const result = await apiCall('POST', '/memberships/generate', {
            amount: 10,
            prefix: `MEMBER${new Date().getFullYear()}`
        }, token);

        if (result.status === 201 || result.status === 200) {
            const codes = result.data.data?.codes || result.data.codes || [];
            createdData.membershipCodes.push(...codes);
            console.log(`✓ Generated ${codes.length} membership codes for ${owner.name}`);
        }
    }
}

// Main seeding function
async function runSeeding() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        WORK ORDER PORTAL - DATA SEEDING SCRIPT            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    try {
        await seedCompanies();
        await seedPositions();
        await seedForms();
        await seedServices();
        await seedClients();
        await seedMembershipCodes();

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                  SEEDING COMPLETED                        ║');
        console.log('╚════════════════════════════════════════════════════════════╝');

        console.log('\n📊 SUMMARY:');
        console.log(`   • Companies: ${createdData.companies.length}`);
        console.log(`   • Owners: ${createdData.owners.length}`);
        console.log(`   • Positions: ${createdData.positions.length}`);
        console.log(`   • Intake Forms: ${createdData.forms.intake.length}`);
        console.log(`   • Work Order Forms: ${createdData.forms.workOrder.length}`);
        console.log(`   • Report Forms: ${createdData.forms.report.length}`);
        console.log(`   • Services: ${createdData.services.length}`);
        console.log(`   • Clients: ${createdData.clients.length}`);
        console.log(`   • Membership Codes: ${createdData.membershipCodes.length}`);

        // Save summary to file
        const fs = require('fs');
        fs.writeFileSync('seeding-summary.json', JSON.stringify(createdData, null, 2));
        console.log('\n💾 Data summary saved to: seeding-summary.json');

    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error);
    }
}

// Run the seeding
runSeeding();
