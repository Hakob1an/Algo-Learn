namespace AlgoLearnAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Username { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int LoginStreak { get; set; } = 0;
        public DateTime? LastLoginDate { get; set; }
        public bool IsVerified { get; set; } = false;
        public string? VerificationToken { get; set; }
    }
}
