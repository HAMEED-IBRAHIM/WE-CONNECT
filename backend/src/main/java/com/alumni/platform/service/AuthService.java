package com.alumni.platform.service;

import com.alumni.platform.dto.AuthResponse;
import com.alumni.platform.dto.LoginRequest;
import com.alumni.platform.dto.RegisterRequest;
import com.alumni.platform.exception.ResourceNotFoundException;
import com.alumni.platform.model.Role;
import com.alumni.platform.model.User;
import com.alumni.platform.model.VerificationStatus;
import com.alumni.platform.repository.UserRepository;
import com.alumni.platform.security.JwtUtils;
import com.alumni.platform.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:WE-CONNECT <onboarding@resend.dev>}")
    private String mailFrom;

    @Value("${spring.mail.password:NOT_SET}")
    private String resendApiKey;

    // In-memory OTP store: email -> OtpData (10-min expiry)
    private final ConcurrentHashMap<String, OtpData> otpStore = new ConcurrentHashMap<>();

    private static class OtpData {
        final String code;
        final long expiresAt;
        boolean verified;

        OtpData(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
            this.verified = false;
        }
    }

    // ─── SEND OTP ─────────────────────────────────────────────────────────────

    public Map<String, Object> sendOtp(String email) {
        if (email == null || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("An account with this email already exists. Please log in.");
        }

        // Generate 6-digit code
        int pin = 100000 + new SecureRandom().nextInt(900000);
        String code = String.valueOf(pin);
        long expiresAt = System.currentTimeMillis() + (10 * 60 * 1000); // 10 minutes

        otpStore.put(cleanEmail, new OtpData(code, expiresAt));

        // Log always (visible in terminal)
        log.info("==========================================================");
        log.info("🔑 [WE-CONNECT OTP] To: {} | Code: {} | Expires: 10 min", cleanEmail, code);
        log.info("==========================================================");

        boolean emailSent = false;
        String errorReason = null;

        // Try to send real email via Resend
        if (!resendApiKey.equals("NOT_SET") && !resendApiKey.equals("YOUR_RESEND_API_KEY_HERE")) {
            try {
                MimeMessage msg = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
                helper.setFrom(mailFrom);
                helper.setTo(cleanEmail);
                helper.setSubject("Your WE-CONNECT verification code: " + code);
                helper.setText(buildOtpEmailHtml(code, cleanEmail), true);
                mailSender.send(msg);
                emailSent = true;
                log.info("✅ OTP email sent successfully to {}", cleanEmail);
            } catch (Exception e) {
                log.warn("⚠️ Email send failed (Resend): {}. OTP still valid, shown in logs.", e.getMessage());
                errorReason = e.getMessage();
            }
        } else {
            log.warn("📧 Resend API key not configured. OTP shown in logs only: {}", code);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("email", cleanEmail);
        res.put("emailSent", emailSent);
        res.put("message", emailSent
            ? "Verification code sent to " + cleanEmail
            : "OTP generated. Check backend logs for code: " + code);
        // Always return code in dev mode for easy testing
        res.put("otp", code);
        return res;
    }

    // ─── VERIFY OTP ───────────────────────────────────────────────────────────

    public Map<String, Object> verifyOtp(String email, String code) {
        if (email == null || code == null || code.isBlank()) {
            throw new IllegalArgumentException("Email and OTP code are required.");
        }
        String cleanEmail = email.trim().toLowerCase();
        OtpData data = otpStore.get(cleanEmail);

        if (data == null) {
            throw new IllegalArgumentException("No OTP was requested for this email. Please request a new code.");
        }
        if (System.currentTimeMillis() > data.expiresAt) {
            otpStore.remove(cleanEmail);
            throw new IllegalArgumentException("OTP code has expired. Please request a new one.");
        }
        if (!data.code.equals(code.trim())) {
            throw new IllegalArgumentException("Invalid OTP code. Please check and try again.");
        }

        data.verified = true;
        log.info("✅ Email verified via OTP: {}", cleanEmail);

        Map<String, Object> res = new HashMap<>();
        res.put("verified", true);
        res.put("message", "Email verified successfully!");
        return res;
    }

    public boolean isEmailVerified(String email) {
        if (email == null) return false;
        OtpData data = otpStore.get(email.trim().toLowerCase());
        return data != null && data.verified;
    }

    // ─── REGISTER ─────────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Enforce OTP verification for manual email registration
        boolean isGoogleOAuth = request.getPassword() != null && request.getPassword().startsWith("google_oauth_");
        if (!isGoogleOAuth && !isEmailVerified(email)) {
            throw new IllegalArgumentException("Email must be verified via OTP before registration.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .verificationStatus(VerificationStatus.NOT_SUBMITTED)
                .enabled(true)
                .build();

        userRepository.save(user);

        // Clear OTP after successful registration
        otpStore.remove(email);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtils.generateToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return buildAuthResponse(token, user, userDetails);
    }

    // ─── GOOGLE LOGIN / OAUTH ─────────────────────────────────────────────────

    public AuthResponse googleLogin(Map<String, String> googleData) {
        String email = googleData.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required for Google Sign-In.");
        }
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail).orElse(null);

        if (user == null) {
            String baseUsername = cleanEmail.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
            String username = baseUsername;
            int suffix = 1;
            while (userRepository.existsByUsername(username)) {
                username = baseUsername + suffix++;
            }

            String firstName = googleData.getOrDefault("firstName", "User");
            String lastName = googleData.getOrDefault("lastName", "");
            String roleStr = googleData.getOrDefault("role", "ROLE_ALUMNI");
            Role role = "ROLE_STUDENT".equalsIgnoreCase(roleStr) ? Role.ROLE_STUDENT : Role.ROLE_ALUMNI;
            String picture = googleData.get("picture");

            user = User.builder()
                    .email(cleanEmail)
                    .username(username)
                    .firstName(firstName)
                    .lastName(lastName)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(role)
                    .profilePicture(picture)
                    .verificationStatus(VerificationStatus.NOT_SUBMITTED)
                    .enabled(true)
                    .build();
            userRepository.save(user);
            log.info("Registered new user via Google Sign-In: {}", cleanEmail);
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtils.generateToken(authentication);

        return buildAuthResponse(token, user, userDetails);
    }

    // ─── LOGIN ────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Check if user exists first — give a clear error if not registered
        if (!userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("No account found with this email. Please register first.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtils.generateToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseGet(() -> userRepository.findByUsername(userDetails.getUsername())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        return buildAuthResponse(token, user, userDetails);
    }

    // ─── BUILD AUTH RESPONSE ──────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(String token, User user, UserDetailsImpl userDetails) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .verificationStatus(user.getVerificationStatus())
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ─── EMAIL HTML TEMPLATE ──────────────────────────────────────────────────

    private String buildOtpEmailHtml(String code, String email) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"/></head>
            <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                      <td style="background:#003366;padding:32px 40px;text-align:center;">
                        <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
                          🎓 WE-CONNECT
                        </h1>
                        <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:14px;">Alumni & Student Networking Platform</p>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">Email Verification</h2>
                        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 28px;">
                          Your one-time verification code is:
                        </p>
                        <!-- OTP Box -->
                        <div style="background:#f0f4ff;border:2px dashed #003366;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                          <span style="font-size:42px;font-weight:900;letter-spacing:10px;color:#003366;font-family:monospace;">%s</span>
                        </div>
                        <p style="color:#64748b;font-size:13px;margin:0 0 8px;">
                          ⏰ This code expires in <strong>10 minutes</strong>.
                        </p>
                        <p style="color:#64748b;font-size:13px;margin:0;">
                          If you didn't request this, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="color:#94a3b8;font-size:12px;margin:0;">
                          © 2026 WE-CONNECT. Connecting alumni and students worldwide.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(code);
    }
}
