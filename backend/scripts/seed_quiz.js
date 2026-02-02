
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
// Use absolute path or simple join
const envPath = path.join(process.cwd(), 'backend', '.env');
dotenv.config({ path: envPath });

// Manually set variables if not picked up (user has .env in backend)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Try frontend
    dotenv.config({ path: path.join(process.cwd(), 'frontend', '.env.local') });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. check .env.local or script path.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedQuiz() {
    console.log("Starting Quiz Seed...");

    // 1. Find the Course "Introduction to Artificial Intelligence"
    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', 'intro-to-ai')
        .single();

    if (courseError || !course) {
        console.error("Course 'intro-to-ai' not found. Please ensure it exists.");
        if (courseError) console.error(courseError);
        return;
    }
    console.log(`Found Course: ${course.id}`);

    // 2. Find "Module 1" (Assuming it's the first module or search by title logic)
    // Let's just grab the first module for this course for simplicity or search "Introduction"
    const { data: moduleData, error: modError } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', course.id)
        .order('order', { ascending: true })
        .limit(1)
        .single();

    if (modError || !moduleData) {
        console.error("No modules found for this course.");
        return;
    }
    console.log(`Found Module: ${moduleData.id}`);

    // 3. Create the Quiz Lesson
    const quizTitle = "AI Fundamentals Quiz";
    const { data: lesson, error: lessonError } = await supabase
        .from('course_lessons')
        .insert({
            module_id: moduleData.id,
            title: quizTitle,
            lesson_type: 'quiz',
            order: 99, // Put it at the end
            is_free_preview: false
        })
        .select()
        .single();

    if (lessonError) {
        console.error("Failed to create lesson:", lessonError);
        return;
    }
    console.log(`Created Lesson: ${lesson.title} (${lesson.id})`);

    // 4. Create Quiz Record (Trigger might have done this? We implemented auto-create in backend API but this is direct DB)
    // Since this is a script, we must insert manually into 'quizzes' table
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
            lesson_id: lesson.id,
            title: "AI Fundamentals Check",
            description: "Test your knowledge on the basics of AI."
        })
        .select()
        .single();

    if (quizError) {
        console.error("Failed to create quiz record:", quizError);
        return;
    }
    console.log(`Created Quiz Record: ${quiz.id}`);

    // 5. Insert Questions & Options
    const questions = [
        {
            text: "What is Artificial Intelligence (AI)?",
            options: [
                { text: "A programming language", correct: false },
                { text: "A machine’s ability to mimic human intelligence", correct: true },
                { text: "A type of computer hardware", correct: false },
                { text: "A database system", correct: false }
            ]
        },
        {
            text: "Which of the following is an example of AI used in daily life?",
            options: [
                { text: "Calculator", correct: false },
                { text: "Word processor", correct: false },
                { text: "Voice assistants like Alexa or Siri", correct: true },
                { text: "USB storage", correct: false }
            ]
        },
        {
            text: "Machine Learning is a subset of:",
            options: [
                { text: "Cybersecurity", correct: false },
                { text: "Data entry", correct: false },
                { text: "Artificial Intelligence", correct: true },
                { text: "Cloud computing", correct: false }
            ]
        },
        {
            text: "What does a Machine Learning model learn from?",
            options: [
                { text: "Random guesses", correct: false },
                { text: "Hardware instructions", correct: false },
                { text: "Training data", correct: true },
                { text: "Internet speed", correct: false }
            ]
        },
        {
            text: "Which task is best suited for AI?",
            options: [
                { text: "Manual typing", correct: false },
                { text: "Pattern recognition in large datasets", correct: true },
                { text: "Physical wiring", correct: false },
                { text: "Turning on a computer", correct: false }
            ]
        },
        {
            text: "Which algorithm type learns using labeled data?",
            options: [
                { text: "Reinforcement Learning", correct: false },
                { text: "Unsupervised Learning", correct: false },
                { text: "Supervised Learning", correct: true },
                { text: "Rule-based programming", correct: false }
            ]
        },
        {
            text: "What is Natural Language Processing (NLP) mainly used for?",
            options: [
                { text: "Image editing", correct: false },
                { text: "Understanding and generating human language", correct: true },
                { text: "Hardware optimization", correct: false },
                { text: "Network security", correct: false }
            ]
        },
        {
            text: "Which of the following is NOT an AI application?",
            options: [
                { text: "Face recognition", correct: false },
                { text: "Recommendation systems", correct: false },
                { text: "Spell checkers", correct: false },
                { text: "Manual data entry by humans", correct: true }
            ]
        },
        {
            text: "What is the main goal of Reinforcement Learning?",
            options: [
                { text: "Memorize data", correct: false },
                { text: "Learn by trial and error using rewards", correct: true },
                { text: "Store large datasets", correct: false },
                { text: "Translate languages", correct: false }
            ]
        },
        {
            text: "Which factor most affects the performance of an AI model?",
            options: [
                { text: "Screen size", correct: false },
                { text: "Keyboard type", correct: false },
                { text: "Quality and quantity of data", correct: true },
                { text: "Internet browser", correct: false }
            ]
        }
    ];

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        // Insert Question
        const { data: qData, error: qError } = await supabase
            .from('quiz_questions')
            .insert({
                quiz_id: quiz.id,
                question_text: q.text,
                order_index: i,
                points: 10
            })
            .select()
            .single();

        if (qError) {
            console.error(`Failed to insert question ${i}:`, qError);
            continue;
        }

        // Insert Options
        const optionsData = q.options.map((opt, idx) => ({
            question_id: qData.id,
            option_text: opt.text,
            is_correct: opt.correct,
            order_index: idx
        }));

        const { error: optError } = await supabase
            .from('quiz_options')
            .insert(optionsData);

        if (optError) {
            console.error(`Failed to insert options for question ${i}:`, optError);
        }
    }

    console.log("✅ Quiz seeded successfully!");
}

seedQuiz();
