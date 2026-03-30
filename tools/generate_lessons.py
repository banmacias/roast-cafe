#!/usr/bin/env python3
"""
WAT Tool: generate_lessons.py
Purpose: Generate lesson modules + questions using Claude API and seed them into the database.
Run once to populate the lesson content for the Roast Cafe app.

Usage:
    python tools/generate_lessons.py

Requirements:
    pip install anthropic psycopg2-binary python-dotenv
"""

import os
import json
import psycopg2
from anthropic import Anthropic
from dotenv import load_dotenv

# Load .env from app directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "app", ".env"))

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
DATABASE_URL = os.environ["DATABASE_URL"]

MODULES = [
    {
        "title": "Coffee Origins",
        "description": "Discover where coffee comes from and what makes each region unique",
        "emoji": "☕",
        "rank_unlock": "COFFEE_LOVER",
        "order": 1,
        "lessons": [
            {"title": "The Coffee Belt", "order": 1},
            {"title": "Africa: The Birthplace", "order": 2},
            {"title": "Latin America: The Powerhouse", "order": 3},
        ],
    },
    {
        "title": "Brewing Methods",
        "description": "Master the science behind different ways to brew coffee",
        "emoji": "⚙️",
        "rank_unlock": "COFFEE_LOVER",
        "order": 2,
        "lessons": [
            {"title": "Espresso Fundamentals", "order": 1},
            {"title": "Pour Over Mastery", "order": 2},
            {"title": "Cold Brew Science", "order": 3},
        ],
    },
    {
        "title": "Tasting & Sensory",
        "description": "Train your palate to detect acidity, body, and flavor notes",
        "emoji": "👅",
        "rank_unlock": "ENTHUSIAST",
        "order": 3,
        "lessons": [
            {"title": "The Flavor Wheel", "order": 1},
            {"title": "Acidity vs Bitterness", "order": 2},
            {"title": "Body and Mouthfeel", "order": 3},
        ],
    },
    {
        "title": "The Roasting Process",
        "description": "Understand how roasting transforms green beans into your morning cup",
        "emoji": "🔥",
        "rank_unlock": "SPECIALTY_DRINKER",
        "order": 4,
        "lessons": [
            {"title": "From Green to Brown", "order": 1},
            {"title": "Light, Medium, Dark", "order": 2},
            {"title": "The Maillard Reaction", "order": 3},
        ],
    },
    {
        "title": "Farming & Fair Trade",
        "description": "Learn about coffee's journey from farm to cup and fair trade ethics",
        "emoji": "🌿",
        "rank_unlock": "SPECIALTY_DRINKER",
        "order": 5,
        "lessons": [
            {"title": "How Coffee is Grown", "order": 1},
            {"title": "Processing Methods", "order": 2},
            {"title": "Fair Trade & Direct Trade", "order": 3},
        ],
    },
    {
        "title": "Barista Fundamentals",
        "description": "Professional techniques for extraction, grinding, and milk steaming",
        "emoji": "👨‍🍳",
        "rank_unlock": "CONNOISSEUR",
        "order": 6,
        "lessons": [
            {"title": "Extraction Theory", "order": 1},
            {"title": "Grind Size & Distribution", "order": 2},
            {"title": "Milk Steaming", "order": 3},
        ],
    },
]


def generate_lesson_content(module_title: str, lesson_title: str) -> dict:
    """Generate lesson content and 5 quiz questions using Claude."""
    print(f"  Generating: {module_title} > {lesson_title}...")

    prompt = f"""You are a coffee education content writer. Generate content for a lesson titled "{lesson_title}" within the module "{module_title}".

Return a JSON object with:
1. "content": A 2-3 paragraph educational text (150-200 words) about the topic
2. "questions": An array of exactly 5 quiz questions, each with:
   - "text": The question
   - "options": Array of exactly 4 answer choices
   - "correctIdx": Index (0-3) of the correct answer
   - "explanation": 2-sentence explanation of why the answer is correct

Make questions engaging, specific, and educational. Vary difficulty from easy to moderate.
Return ONLY valid JSON, no other text."""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text
    json_match = text[text.find("{") : text.rfind("}") + 1]
    return json.loads(json_match)


def seed_database():
    """Connect to DB and insert all lesson content."""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    for module_data in MODULES:
        print(f"\n📚 Module: {module_data['title']}")

        # Insert module
        cur.execute(
            """
            INSERT INTO "Module" (id, title, description, emoji, "rankUnlock", "order")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
            RETURNING id
            """,
            (
                module_data["title"],
                module_data["description"],
                module_data["emoji"],
                module_data["rank_unlock"],
                module_data["order"],
            ),
        )
        result = cur.fetchone()
        if not result:
            print(f"  ⚠️  Module already exists, skipping...")
            continue

        module_id = result[0]

        for lesson_data in module_data["lessons"]:
            content_data = generate_lesson_content(
                module_data["title"], lesson_data["title"]
            )

            # Insert lesson
            cur.execute(
                """
                INSERT INTO "Lesson" (id, "moduleId", title, content, "order")
                VALUES (gen_random_uuid(), %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    module_id,
                    lesson_data["title"],
                    content_data["content"],
                    lesson_data["order"],
                ),
            )
            lesson_id = cur.fetchone()[0]

            # Insert questions
            for q in content_data["questions"]:
                cur.execute(
                    """
                    INSERT INTO "Question" (id, "lessonId", text, options, "correctIdx",
                                          explanation, difficulty, "isTrivia")
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, false)
                    """,
                    (
                        lesson_id,
                        q["text"],
                        q["options"],
                        q["correctIdx"],
                        q["explanation"],
                        module_data["rank_unlock"],
                    ),
                )

        conn.commit()
        print(f"  ✅ {module_data['title']} seeded successfully")

    cur.close()
    conn.close()
    print("\n✅ All lessons seeded!")


if __name__ == "__main__":
    print("🌱 Generating and seeding lesson content...")
    print("⚠️  This will call the Claude API and may take a few minutes.\n")
    seed_database()
