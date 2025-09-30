# Quick Start Guide - Authentication System

## Developer Setup (5 minutes)

### 1. Install Required Packages
```bash
cd src/DigitalSignage.Infrastructure
dotnet add package BCrypt.Net-Next
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### 2. Apply Database Migration
```bash
dotnet ef migrations add AddAuthenticationSystem -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

### 3. Update Configuration
Add to `appsettings.Development.json`:
```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-minimum-32-characters",
    "Issuer": "DigitalSignage.Api",
    "Audience": "DigitalSignage.Client",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  }
}
```

## API Testing (Postman/curl)

### 1. Register New User
```bash
curl -X POST http://localhost:8089/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "fullName": "System Administrator",
    "role": "Admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Use Access Token
```bash
curl -X GET http://localhost:8089/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Frontend Integration

### React/Next.js Example
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const { accessToken, refreshToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };
  
  return { login, logout };
};
```

### Device Authentication
```csharp
// For Digital Signage devices
public class DeviceAuthService
{
    public async Task<string> AuthenticateDevice(string deviceKey)
    {
        var request = new DeviceLoginRequest { DeviceKey = deviceKey };
        var response = await httpClient.PostAsJsonAsync("/api/auth/device-login", request);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result.AccessToken;
    }
}
```

## Common Issues & Solutions

### Issue: JWT Token Expired
**Solution**: Implement automatic token refresh
```csharp
public async Task<string> GetValidTokenAsync()
{
    if (IsTokenExpired(accessToken))
    {
        accessToken = await RefreshTokenAsync(refreshToken);
    }
    return accessToken;
}
```

### Issue: 401 Unauthorized
**Checklist**:
- ✅ Token included in Authorization header
- ✅ Token format: `Bearer {token}`
- ✅ Token not expired
- ✅ User has required role/permissions

### Issue: Password Not Secure Enough
**Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character

## Environment Variables

### Production Setup
```bash
export JWT_SECRET_KEY="your-production-secret-key-minimum-32-characters"
export JWT_ISSUER="DigitalSignage.Api"
export JWT_AUDIENCE="DigitalSignage.Client"
export JWT_ACCESS_TOKEN_EXPIRY_MINUTES=15
export JWT_REFRESH_TOKEN_EXPIRY_DAYS=7
```

### Docker Configuration
```dockerfile
ENV JWT_SECRET_KEY="your-production-secret-key-minimum-32-characters"
ENV JWT_ISSUER="DigitalSignage.Api"
ENV JWT_AUDIENCE="DigitalSignage.Client"
```

## Security Checklist

- [ ] JWT secret key is at least 32 characters
- [ ] Tokens are stored securely (HttpOnly cookies recommended)
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured
- [ ] Account lockout is implemented
- [ ] Password complexity requirements are enforced
- [ ] Refresh token rotation is enabled