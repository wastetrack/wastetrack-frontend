export const tokenUtils = {
  decodeToken(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    return decoded.exp < Date.now() / 1000;
  },

  isTokenExpiringSoon(token: string, bufferMinutes: number = 1): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const currentTime = Date.now() / 1000;
    const bufferTime = bufferMinutes * 60;
    return decoded.exp < currentTime + bufferTime;
  },

  getTokenExpirationTime(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded?.exp || null;
  },
};
