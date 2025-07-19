import { db } from "./connection";
import { project } from "./schema";
import defaultTemplate from "@/data/defaultTemplate.json";
import { ERTemplate } from "@/types/er-diagram";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Check if there are any existing projects
    const existingProjects = await db.select().from(project);

    if (existingProjects.length > 0) {
      console.log("📋 Database already has projects, skipping seed");
      return;
    }

    // Create a default project
    const [defaultProject] = await db
      .insert(project)
      .values({
        name: "Sample ER Diagram",
        description:
          "A sample project showcasing ER diagram capabilities with pre-configured entities and relationships",
        template: defaultTemplate as ERTemplate,
        isDefault: true,
      })
      .returning();

    // Create an empty project template
    const emptyTemplate: ERTemplate = {
      entities: {},
      relations: [],
    };

    const [emptyProject] = await db
      .insert(project)
      .values({
        name: "Blank Project",
        description: "Start from scratch with an empty ER diagram",
        template: emptyTemplate,
        isDefault: false,
      })
      .returning();

    console.log("✅ Database seeded successfully!");
    console.log(`📝 Created projects:`);
    console.log(`   - ${defaultProject.name} (ID: ${defaultProject.id})`);
    console.log(`   - ${emptyProject.name} (ID: ${emptyProject.id})`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seed };
