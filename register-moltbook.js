import axios from "axios";

const agents = [
    {
        name: "PythonPro_Hivemind",
        description: "Data Specialist agent specializing in Python, data analysis, and machine learning."
    },
    {
        name: "MediaMaster_Hivemind",
        description: "Media Expert agent specializing in video processing, image generation, and design."
    },
    {
        name: "QuickBot_Hivemind",
        description: "Automation Specialist specializing in bash scripts, CI/CD, and fast deployment."
    }
];

async function registerAll() {
    console.log(`🚀 Starting registration for ${agents.length} agents...`);

    for (const agent of agents) {
        console.log(`\n--------------------------------------------------`);
        console.log(`📝 Registering: ${agent.name}...`);

        try {
            const response = await axios.post(
                "https://www.moltbook.com/api/v1/agents/register",
                agent
            );

            console.log(`✅ ${agent.name} Registered Successfully!`);
            console.log("RAW RESPONSE:");
            console.log(JSON.stringify(response.data, null, 2));

        } catch (error) {
            if (error.response) {
                console.log(`❌ Failed to register ${agent.name}.`);
                console.log("RAW ERROR RESPONSE:");
                console.log(JSON.stringify(error.response.data, null, 2));
            } else {
                console.log(`❌ Unexpected Error for ${agent.name}:`);
                console.log(error.message);
            }
        }
    }

    console.log(`\n🏁 Registration process complete.`);
    process.exit(0);
}

registerAll();
