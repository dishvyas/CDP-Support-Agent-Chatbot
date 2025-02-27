const request = require("supertest");
const app = require("./server"); // ✅ Make sure this correctly imports your Express app

describe("Chatbot Backend Tests", () => {
    
    test("✅ Should return correct answer for a valid Segment question", async () => {
        const res = await request(app).post("/api/query").send({
            question: "How do I set up event tracking in Segment?",
            platform: "Segment"
        });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.answers[0].answer).toContain("To set up a new source in Segment");
    });

    test("✅ Should detect platform mismatch", async () => {
        const res = await request(app).post("/api/query").send({
            question: "How do I integrate mParticle with Salesforce?",
            platform: "Segment"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.answers[0].answer).toContain("Platform mismatch detected!");
    });

    test("✅ Should return 'No relevant answer found' for an irrelevant question", async () => {
        const res = await request(app).post("/api/query").send({
            question: "How do I cook pasta in Segment?",
            platform: "Segment"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.answers[0].answer).toBe("I'm sorry, but I couldn't find a relevant answer to your question.");
    });

    test("✅ Should return correct comparison for two CDPs", async () => {
        const res = await request(app).post("/api/query").send({
            question: "How does Segment compare to Lytics?",
            platform: "Segment"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.answers[0].answer).toContain("**Feature:");
    });

    test("✅ Should return 'No relevant answer found' for an unknown question", async () => {
        const res = await request(app).post("/api/query").send({
            question: "Tell me about blockchain support in Lytics.",
            platform: "Lytics"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.answers[0].answer).toBe("No relevant answer found.");
    });

});
