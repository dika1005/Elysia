import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { RegisterService } from "../../services/auth/register.service";
import { LoginService } from "../../services/auth/login.service";
import { LogoutService } from "../../services/auth/logout.service";
import { jwtConfig } from "../../utils/jwt";
import { successResponse, errorResponse } from "../../utils/response";

const registerService = new RegisterService();
const loginService = new LoginService();
const logoutService = new LogoutService();

export const authController = new Elysia({ prefix: "/api/auth" })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: jwtConfig.secret,
      exp: jwtConfig.accessTokenExpiry,
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: jwtConfig.secret,
      exp: jwtConfig.refreshTokenExpiry,
    })
  )

  // REGISTER
  .post(
    "/register",
    async ({ body }) => {
      try {
        const user = await registerService.register(body as any);
        return successResponse(user, "User registered successfully", 201);
      } catch (error: any) {
        return errorResponse(error.message, 400);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        name: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 }),
        phone: t.Optional(t.String()),
        avatar: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Register new user",
        description: "Create a new user account",
      },
    }
  )

  // LOGIN
  .post(
    "/login",
    async ({ body, jwt, refreshJwt, cookie: { accessToken, refreshToken } }) => {
      try {
        const { user, payload } = await loginService.login(
          body.email,
          body.password
        );

        // Generate access token (15 menit)
        const access = await jwt.sign(payload as any);

        // Generate refresh token (20 menit)
        const refresh = await refreshJwt.sign(payload as any);

        // Simpan refresh token ke database
        await loginService.saveRefreshToken(user.id, refresh as string);

        // Set cookies
        accessToken.set({
          value: access as string,
          httpOnly: true,
          maxAge: 15 * 60,
          path: "/",
          sameSite: "lax",
        });

        refreshToken.set({
          value: refresh as string,
          httpOnly: true,
          maxAge: 20 * 60,
          path: "/",
          sameSite: "lax",
        });

        return successResponse(
          {
            user,
            accessToken: access,
            refreshToken: refresh,
          },
          "Login successful"
        );
      } catch (error: any) {
        return errorResponse(error.message, 401);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Login user",
        description: "Login with email and password",
      },
    }
  )

  // REFRESH TOKEN
  .post(
    "/refresh",
    async ({ refreshJwt, jwt, cookie: { refreshToken, accessToken } }) => {
      try {
        const token = refreshToken.value as string;
        if (!token) {
          return errorResponse("Refresh token not found", 401);
        }

        // Validasi refresh token dari database
        const { payload } = await loginService.validateRefreshToken(token);

        // Generate access token baru
        const newAccessToken = await jwt.sign(payload as any);

        // Set cookie access token baru
        accessToken.set({
          value: newAccessToken as string,
          httpOnly: true,
          maxAge: 15 * 60,
          path: "/",
          sameSite: "lax",
        });

        return successResponse(
          { accessToken: newAccessToken },
          "Access token refreshed"
        );
      } catch (error: any) {
        return errorResponse(error.message, 401);
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Get new access token using refresh token",
      },
    }
  )

  // LOGOUT
  .post(
    "/logout",
    async ({ cookie: { accessToken, refreshToken } }) => {
      try {
        const token = refreshToken.value as string;
        if (!token) {
          return errorResponse("Refresh token not found", 401);
        }

        // Hapus refresh token dari database
        await logoutService.logout(token);

        // Clear cookies
        accessToken.remove();
        refreshToken.remove();

        return successResponse(null, "Logout successful");
      } catch (error: any) {
        return errorResponse(error.message, 400);
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Logout user",
        description: "Logout and remove refresh token",
      },
    }
  )

  // LOGOUT ALL DEVICES
  .post(
    "/logout-all",
    async ({ jwt, cookie: { accessToken, refreshToken } }) => {
      try {
        const token = accessToken.value as string;
        if (!token) {
          return errorResponse("Access token not found", 401);
        }

        // Verify access token untuk dapat userId
        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse("Invalid access token", 401);
        }

        // Hapus semua refresh token user
        await logoutService.logoutAll((payload as any).id);

        // Clear cookies
        accessToken.remove();
        refreshToken.remove();

        return successResponse(null, "Logout from all devices successful");
      } catch (error: any) {
        return errorResponse(error.message, 400);
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Logout from all devices",
        description: "Logout and remove all refresh tokens",
      },
    }
  );
