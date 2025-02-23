using AlgoLearnAPI.Controllers;
using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;
using System.Linq;

namespace AlgoLearnAPI.Services
{
    public class ProfileService
    {
        private readonly AppDbContext _context;

        public ProfileService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// This method is responsible for retrieving user profile info.
        /// </summary>
        /// <param name="email"></param>
        /// <returns>
        /// Returns null if user is not found.
        /// Returns an anonymous object which contains:
        /// - Username
        /// - Email
        /// - CreatedAt (registration date)
        /// - Progress (percentage of completed topics)
        /// - LoginStreak (current consecutive logins)
        /// - Achievements (list of earned achievements)
        /// </returns>
        public object GetProfile(string email)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
            {
                return null;
            }

            TrackUserLogin(user);
            AssignAchievements(user);

            var completedTopics = _context.UserCompletions
                .Where(p => p.UserId == user.Id)
                .Select(p => p.TopicName)
                .ToList();

            int totalTopics = DashboardController.problemSuggestions.Keys.Count();
            int progress = (totalTopics > 0) ? (completedTopics.Count() * 100) / totalTopics : 0;

            var userAchievements = _context.UserAchievements
                .Where(ua => ua.UserId == user.Id)
                .Select(ua => ua.Achievement.Name)
                .ToList();

            return new
            {
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                Progress = progress,
                LoginStreak = user.LoginStreak,
                Achievements = userAchievements
            };
        }

        /// <summary>
        /// This method tracks the user's login activity and updates their login streak.
        /// If the user logs in consecutively, their streak increases.
        /// If they miss a day, the streak resets to 1.
        /// </summary>
        /// <param name="user">The user who's activity is being tracked.</param>
        public void TrackUserLogin(User user)
        {
            var today = DateTime.UtcNow.Date;

            if (user.LastLoginDate == null || (user.LastLoginDate.Value.Date < today.AddDays(-1)))
            {
                user.LoginStreak = 1;
            }
            else if (user.LastLoginDate.Value.Date == today.AddDays(-1))
            {
                user.LoginStreak += 1;
            }

            user.LastLoginDate = today;
            _context.SaveChanges();
        }

        /// <summary>
        /// This method assigns achievements to a user based on their progress, completed topics,
        /// and login streak. This checks if the user qualifies for any achievements
        /// and adds them if necessary.
        /// </summary>
        /// <param name="user">The user whose achievements are being updated.</param>
        public void AssignAchievements(User user)
        {
            var completedTopics = _context.UserCompletions
                .Where(p => p.UserId == user.Id)
                .Select(p => p.TopicName)
                .ToList();

            int totalTopics = DashboardController.problemSuggestions.Keys.Count();
            int progress = (totalTopics > 0) ? (completedTopics.Count() * 100) / totalTopics : 0;

            var algorithmTopics = new List<string> { "BubbleSort", "Dijkstra" };
            var dataStructureTopics = new List<string> { "LinkedList", "BinaryTree" };

            int totalAlgorithms = algorithmTopics.Count;
            int totalDataStructures = dataStructureTopics.Count;

            int completedAlgorithms = completedTopics.Count(t => algorithmTopics.Contains(t));
            int completedDataStructures = completedTopics.Count(t => dataStructureTopics.Contains(t));

            var achievementsToAssign = new Dictionary<string, string>
            {
                { "🔥 Active Learner", user.LoginStreak >= 5 ? "Stay active for 5 days" : null },
                { "🏅 Problem Solver", (completedTopics.Count > 0 && completedTopics.Count == totalTopics) ? "Complete all topics" : null },
                { "📌 Algorithm Explorer", completedAlgorithms >= 1 ? "Complete one algorithm" : null },
                { "🗂️ Data Structure Explorer", completedDataStructures >= 1 ? "Complete one data structure" : null },
                { "🏅 Intermediate Coder", progress >= 50 ? "Reach 50% progress" : null },
                { "🧠 Algorithm Master", completedAlgorithms == totalAlgorithms ? "Complete all algorithms" : null },
                { "🌳 Data Structures Master", completedDataStructures == totalDataStructures ? "Complete all data structures" : null }
            };

            foreach (var (name, description) in achievementsToAssign)
            {
                if (description != null)
                {
                    var achievement = _context.Achievements.SingleOrDefault(a => a.Name == name);
                    if (achievement == null)
                    {
                        achievement = new Achievement { Name = name, Description = description };
                        _context.Achievements.Add(achievement);
                        _context.SaveChanges();
                    }

                    if (!_context.UserAchievements.Any(ua => ua.UserId == user.Id && ua.AchievementId == achievement.Id))
                    {
                        _context.UserAchievements.Add(new UserAchievement
                        {
                            UserId = user.Id,
                            AchievementId = achievement.Id
                        });
                    }
                }
            }
            _context.SaveChanges();
        }

        /// <summary>
        /// This method updates the profile details of a user, including their username, email,
        /// and password (if provided). The password is hashed before storing.
        /// </summary>
        /// <param name="oldEmail">The current email of the user before the update.</param>
        /// <param name="model">The update profile request containing new values.</param>
        /// <returns>
        /// Returns true if the profile update is successful.
        /// Returns false if the user is not found.
        /// </returns>
        public bool UpdateProfile(string oldEmail, UpdateProfileRequest model)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == oldEmail);
            if (user == null)
            {
                return false;
            }

            if (!string.IsNullOrWhiteSpace(model.Username))
                user.Username = model.Username;

            if (!string.IsNullOrWhiteSpace(model.Email))
                user.Email = model.Email;

            if (!string.IsNullOrWhiteSpace(model.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
            }

            _context.SaveChanges();
            return true;
        }
    }

    /// <summary>
    /// DTO used for handling profile update requests
    /// </summary>
    public class UpdateProfileRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }      // if user wants to change their email
        public string Password { get; set; }   // if user wants to change their password
    }
}
