import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chatbot from "./Chatbot";

// ✅ Properly mock fetch responses
global.fetch = jest.fn(async (url, options) => {
    if (!options || !options.body) {
        return Promise.resolve({
            ok: false,
            json: async () => ({ answers: [{ answer: "Error: Invalid request" }] }),
        });
    }

    const requestBody = JSON.parse(options.body);

    if (requestBody.question.includes("set up event tracking in Segment")) {
        return Promise.resolve({
            ok: true,
            json: async () => ({
                answers: [{ answer: "To set up a new source in Segment, go to the Sources section..." }]
            }),
        });
    }

    if (requestBody.question.includes("cook pasta")) {
        return Promise.resolve({
            ok: true,
            json: async () => ({
                answers: [{ answer: "I'm sorry, but I couldn't find a relevant answer to your question." }]
            }),
        });
    }

    return Promise.resolve({
        ok: true,
        json: async () => ({
            answers: [{ answer: "I'm sorry, but I couldn't find a relevant answer to your question." }]
        }),
    });
});

describe("Chatbot Frontend Tests", () => {
    test("✅ Should render chatbot UI correctly", () => {
        render(<Chatbot />);
        expect(screen.getByText("CDP Support Chatbot")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    test("✅ Should send a user message and receive a bot response", async () => {
        render(<Chatbot />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "How do I set up event tracking in Segment?" } });

        fireEvent.click(screen.getByText("Send"));

        // ✅ Use a function to match partial text within elements
        const response = await screen.findByText((content) =>
            content.includes("To set up a new source in Segment"),
            { exact: false }
        );
        expect(response).toBeInTheDocument();
    });

    test("✅ Should handle platform selection", async () => {
        render(<Chatbot />);

        const select = screen.getByRole("combobox");

        // ✅ Open dropdown
        userEvent.click(select);
        await screen.findByText("mParticle");

        // ✅ Select mParticle
        userEvent.click(screen.getByText("mParticle"));

        // ✅ Confirm selection
        expect(select).toHaveTextContent("mParticle");
    });

    test("✅ Should show error for an invalid question", async () => {
        render(<Chatbot />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "How do I cook pasta in Segment?" } });

        fireEvent.click(screen.getByText("Send"));

        // ✅ Match text even if inside a different wrapper
        const response = await screen.findByText((content) =>
            content.includes("I'm sorry, but I couldn't find a relevant answer to your question."),
            { exact: false }
        );
        expect(response).toBeInTheDocument();
    });
});
