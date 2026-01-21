import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Try to find an existing user or create a placeholder one if needed
    // In a real scenario, we might want to attach this to the first user we find
    let user = await prisma.user.findFirst();

    if (!user) {
        console.log('No user found. Creating a placeholder user for the sample workflow.');
        // This relies on the schema. If clerkId is unique/required, we fake it.
        user = await prisma.user.create({
            data: {
                clerkId: 'user_placeholder_' + Date.now(),
                email: 'demo@example.com',
            }
        });
    }

    const workflowName = "Product Marketing Kit Generator";

    // Check if workflow already exists
    const existing = await prisma.workflow.findFirst({
        where: {
            userId: user.id,
            name: workflowName
        }
    });

    if (existing) {
        console.log(`Workflow "${workflowName}" already exists. Skipping.`);
        return;
    }

    // Define Nodes
    const nodes = [
        // BRANCH A
        {
            id: 'node-1',
            type: 'uploadImageNode',
            position: { x: 100, y: 100 },
            data: { label: 'Upload Product Photo', status: 'idle' } // User uploads image
        },
        {
            id: 'node-2',
            type: 'cropNode',
            position: { x: 100, y: 300 },
            data: {
                label: 'Crop to Product',
                status: 'idle',
                x: "10", y: "10", width: "80", height: "80"
            }
        },
        {
            id: 'node-3',
            type: 'textNode',
            position: { x: 350, y: 100 },
            data: {
                label: 'System Prompt',
                text: 'You are a professional marketing copywriter. Generate a compelling one-paragraph product description.'
            }
        },
        {
            id: 'node-4',
            type: 'textNode',
            position: { x: 350, y: 250 },
            data: {
                label: 'Product Details',
                text: 'Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.'
            }
        },
        {
            id: 'node-5',
            type: 'llmNode',
            position: { x: 300, y: 500 },
            data: {
                label: 'Generate Description',
                status: 'idle',
                model: 'gemini-pro'
            }
        },

        // BRANCH B
        {
            id: 'node-6',
            type: 'uploadVideoNode',
            position: { x: 600, y: 100 },
            data: { label: 'Upload Demo Video', status: 'idle' }
        },
        {
            id: 'node-7',
            type: 'extractNode',
            position: { x: 600, y: 300 },
            data: {
                label: 'Extract Frame',
                status: 'idle',
                timestamp: "50%"
            }
        },

        // CONVERGENCE
        {
            id: 'node-8',
            type: 'textNode',
            position: { x: 500, y: 600 },
            data: {
                label: 'Marketing Prompt',
                text: 'You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.'
            }
        },
        {
            id: 'node-9',
            type: 'llmNode',
            position: { x: 450, y: 800 },
            data: {
                label: 'Final Marketing Post',
                status: 'idle',
                model: 'gemini-pro-vision'
            }
        }
    ];

    // Define Edges
    const edges = [
        // Branch A Connections
        { id: 'e1-2', source: 'node-1', target: 'node-2', sourceHandle: 'image:output', targetHandle: 'image:input' },

        { id: 'e2-5', source: 'node-2', target: 'node-5', sourceHandle: 'image:output', targetHandle: 'image:input' },
        { id: 'e3-5', source: 'node-3', target: 'node-5', sourceHandle: 'text:output', targetHandle: 'text:system' },
        { id: 'e4-5', source: 'node-4', target: 'node-5', sourceHandle: 'text:output', targetHandle: 'text:user' },

        // Branch B Connections
        { id: 'e6-7', source: 'node-6', target: 'node-7', sourceHandle: 'video:output', targetHandle: 'video:input' },

        // Convergence Connections (Node 9)
        // Needs: System Prompt (Node 8), User Message (Node 5 output), Images (Node 2 + Node 7)

        { id: 'e8-9', source: 'node-8', target: 'node-9', sourceHandle: 'text:output', targetHandle: 'text:system' },
        { id: 'e5-9', source: 'node-5', target: 'node-9', sourceHandle: 'text:output', targetHandle: 'text:user' }, // Description as user message context
        { id: 'e2-9', source: 'node-2', target: 'node-9', sourceHandle: 'image:output', targetHandle: 'image:input' }, // Cropped Image
        { id: 'e7-9', source: 'node-7', target: 'node-9', sourceHandle: 'image:output', targetHandle: 'image:input' }, // Extracted Frame
    ];

    const workflow = await prisma.workflow.create({
        data: {
            userId: user.id,
            name: workflowName,
            nodes: nodes,
            edges: edges,
        }
    });

    console.log(`✅ Created sample workflow: ${workflow.name} (ID: ${workflow.id})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
