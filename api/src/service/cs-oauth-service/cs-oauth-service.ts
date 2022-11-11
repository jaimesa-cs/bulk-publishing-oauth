import axios from "axios";
import express from "express";

require("dotenv").config();

export class CsWithOAuthService {
  public async refreshToken(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("client_id", process.env.CS_CLIENT_ID || "");
      params.append("client_secret", process.env.CS_CLIENT_SECRET || "");
      params.append("redirect_uri", process.env.CS_REDIRECT_URI || "");
      params.append("refresh_token", refreshToken);

      // console.log("Params", params);
      const now = Date.now(); //This ensures the expires_at is always correct.
      const response = await axios.post("https://app.contentstack.com/apps-api/apps/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      res.json({ ...response.data, expires_at: now + response.data.expires_in * 1000 });
    } catch (e: any) {
      console.log("Error", e.response.data);
      res.status(403).json({ error: "Unauthorized" });
    }
  }

  public async exchangeCode(req: express.Request, res: express.Response): Promise<void> {
    let data = null;
    try {
      const { code } = req.body;

      data = await this.exchange(code);
      res.json(data);
    } catch (e) {
      res.status(500).json({ initialized: false, access_token: "error", error: data });
    }
  }

  private async exchange(code: string): Promise<any> {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.CS_CLIENT_ID || "");
    params.append("client_secret", process.env.CS_CLIENT_SECRET || "");
    params.append("redirect_uri", process.env.CS_REDIRECT_URI || "");
    params.append("code", code);

    try {
      const now = Date.now(); //This ensures the expires_at is always correct.
      const response = await axios.post("https://app.contentstack.com/apps-api/apps/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return { ...response.data, expires_at: now + response.data.expires_in * 1000 };
    } catch (errorResponse: any) {
      return errorResponse.response.data;
    }
  }
}
