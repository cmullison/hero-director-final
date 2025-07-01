import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock the session endpoint to always return authenticated
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      authenticated: true,
      user: {
        id: "mocked-user-id",
        email: "mocked@example.com",
        name: "Mocked User",
        image: null,
        teams: [
          {
            name: "Mocked Team",
            logo: "",
            plan: "premium",
          },
        ],
      },
    });
  }),

  // Original endpoint mock example
  http.post("/api/authlogin", () => {
    return HttpResponse.json({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
      email: "test@user.com",
      password: "password",
    });
  }),
];
