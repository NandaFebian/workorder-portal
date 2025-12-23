import * as mongoose from 'mongoose';
import * as path from 'path';
import * as fs from 'fs';

// Import semua schemas
import { UserSchema } from './users/schemas/user.schema';
import { WorkOrderSchema } from './work-order/schemas/work-order.schema';
import { WorkReportSchema } from './work-report/schemas/work-report.schema';
import { ServiceSchema } from './service/schemas/service.schema';
import { FormSubmissionSchema as ServiceFormSubmissionSchema } from './service/schemas/form-submission.schema';
import { FormTemplateSchema } from './form/schemas/form-template.schema';
import { FormSubmissionSchema } from './form/schemas/form-submissions.schema';
import { MembershipCodeSchema } from './membership/schemas/membership.schema';
import { PositionSchema } from './positions/schemas/position.schema';
import { ClientServiceRequestSchema } from './client-service-request/schemas/client-service-request.schema';
import { ActiveTokenSchema } from './auth/schemas/active-token.schema';
import { InvitationSchema } from './company/schemas/invitation.schema';

interface ModelDefinition {
    name: string;
    schema: mongoose.Schema;
}

function extractSchemaInfo(modelName: string, schema: mongoose.Schema): any {
    const fields: string[] = [];
    const relationships: string[] = [];

    schema.eachPath((pathname, schematype) => {
        // Skip internal fields
        if (pathname === '_id' || pathname === '__v') return;

        const fieldType = schematype.instance;
        const options = (schematype as any).options;

        // Check if it's a reference to another model
        if (options?.ref) {
            const refModel = options.ref;
            relationships.push(`    ${modelName} }o--|| ${refModel} : "references"`);
        } else if (options?.type && Array.isArray(options.type) && options.type[0]?.ref) {
            const refModel = options.type[0].ref;
            relationships.push(`    ${modelName} }o--o{ ${refModel} : "has many"`);
        } else {
            // Regular field
            const required = options?.required ? '*' : '';
            fields.push(`        ${fieldType} ${pathname}${required}`);
        }
    });

    return { fields, relationships };
}

async function generateERD() {
    try {
        console.log('🚀 Starting ERD Generation...');

        // Register semua models
        const modelDefinitions: ModelDefinition[] = [
            { name: 'User', schema: UserSchema },
            { name: 'WorkOrder', schema: WorkOrderSchema },
            { name: 'WorkReport', schema: WorkReportSchema },
            { name: 'Service', schema: ServiceSchema },
            { name: 'ServiceFormSubmission', schema: ServiceFormSubmissionSchema },
            { name: 'FormTemplate', schema: FormTemplateSchema },
            { name: 'FormSubmission', schema: FormSubmissionSchema },
            { name: 'MembershipCode', schema: MembershipCodeSchema },
            { name: 'Position', schema: PositionSchema },
            { name: 'ClientServiceRequest', schema: ClientServiceRequestSchema },
            { name: 'ActiveToken', schema: ActiveTokenSchema },
            { name: 'Invitation', schema: InvitationSchema },
        ];

        console.log(`✅ Processing ${modelDefinitions.length} models`);

        // Generate Mermaid ERD
        let mermaidERD = 'erDiagram\n';
        const allRelationships: string[] = [];

        modelDefinitions.forEach(({ name, schema }) => {
            const { fields, relationships }: any = extractSchemaInfo(name, schema);

            if (fields.length > 0) {
                mermaidERD += `    ${name} {\n`;
                mermaidERD += fields.join('\n') + '\n';
                mermaidERD += `    }\n`;
            }

            allRelationships.push(...relationships);
        });

        // Add all relationships at the end
        if (allRelationships.length > 0) {
            mermaidERD += '\n' + allRelationships.join('\n') + '\n';
        }

        // Save to file
        const outputDir = path.join(__dirname, '..', 'docs');
        const outputFile = path.join(outputDir, 'entity-relationship-diagram.md');

        // Pastikan folder docs ada
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log('📁 Created docs directory');
        }

        const content = `# Entity Relationship Diagram

Ini adalah ERD yang dihasilkan secara otomatis dari mongoose schemas.

\`\`\`mermaid
${mermaidERD}
\`\`\`

---
*Generated at: ${new Date().toISOString()}*
`;

        fs.writeFileSync(outputFile, content, 'utf-8');

        console.log(`✅ ERD successfully generated at: ${outputFile}`);
        console.log('📊 You can view this ERD in GitHub, VSCode, or any Mermaid-compatible viewer');
        console.log('🎉 Done!');

    } catch (error) {
        console.error('❌ Error generating ERD:', error);
        process.exit(1);
    }
}

// Run the generator
generateERD();
