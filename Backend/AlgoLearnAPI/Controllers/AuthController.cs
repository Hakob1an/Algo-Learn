using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Services;
using AlgoLearnAPI.Models;
using AlgoLearnAPI.Data;
using Microsoft.Extensions.Configuration;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _authService = new AuthService(context, config);
            _emailService = new EmailService(config);
            _config = config;
        }

        /// <summary>
        /// This endpoint handles user login. 
        /// It allows only verified users to log in.
        /// </summary>
        /// <param name="request"> The login request containing email and password</param>
        /// <returns>
        /// Returns a 200 OK response with a welcome message if authentication is successful.
        /// Returns a 401 Unauthorized response if credentials are incorrect or the account is not verified.
        /// Returns a 500 Internal Server Error if an unexpected issue occurs.
        /// </returns>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = _authService.Login(request.Email, request.Password);
                return Ok(new { message = $"Welcome back, {user.Username}!" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// This endpoint handles user registration.
        /// It generates a verification code and sends it to users' email.
        /// </summary>
        /// <param name="request">The registration request containing email, password and username</param>
        /// <returns>
        /// Returns a 200 OK response if registration is successful, and a verification code is sent.
        /// Returns a 400 Bad Request response if the email is already registered or the password is invalid.
        /// Returns a 500 Internal Server Error if an unexpected issue occurs.
        /// </returns>
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            try
            {
                var verificationCode = _authService.Register(request.Email, request.Password, request.Username);

                if (verificationCode == null)
                    return BadRequest(new { message = "Email already exists." });

                string subject = "Your AlgoLearn Verification Code";
                string body = $"<h2>Hello {request.Username},</h2>"
                            + $"<p>Your verification code is: <strong>{verificationCode}</strong></p>"
                            + "<p>Please enter this code on the verification page to activate your account.</p>";

                Console.WriteLine($"📧 [DEBUG] Sending Email to: {request.Email}, Code: {verificationCode}"); // ✅ Debugging

                _emailService.SendEmail(request.Email, subject, body);

                return Ok(new { message = "Verification code sent to your email. Please enter it to verify your account." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// This endpoint verifies the 6-digit code that user enters
        /// </summary>
        /// <param name="request">The verification request that contains user email and verfication code</param>
        /// <returns>
        /// Returns a 400 Bad Request response if the verification code is invalid or expired.
        /// Returns a 200 Ok response if verification code is valid and user is successfully registered.
        /// </returns>
        [HttpPost("verify-code")]
        public IActionResult VerifyCode([FromBody] VerifyCodeRequest request)
        {
            bool verified = _authService.VerifyEmail(request.Email, request.Code);

            if (!verified)
                return BadRequest(new { message = "Invalid or expired verification code." });

            return Ok(new { message = "Email successfully verified. You can now log in." });
        }


    }

    /// <summary>
    /// Request models
    /// </summary>
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class VerifyCodeRequest
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }
}
