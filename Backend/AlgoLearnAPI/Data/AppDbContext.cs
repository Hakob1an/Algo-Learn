using Microsoft.EntityFrameworkCore;
using AlgoLearnAPI.Models;

namespace AlgoLearnAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<UserCompletion> UserCompletions { get; set; }
        public DbSet<Progress> Progresses { get; set; }
        public DbSet<Suggestion> Suggestions { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Progress>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<UserCompletion>()
                .HasOne(uc => uc.User)
                .WithMany()
                .HasForeignKey(uc => uc.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievement>()
                .HasOne(ua => ua.User)
                .WithMany()
                .HasForeignKey(ua => ua.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievement>()
                .HasOne(ua => ua.Achievement)
                .WithMany()
                .HasForeignKey(ua => ua.AchievementId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Suggestion>()
                .HasOne(s => s.Topic)
                .WithMany()
                .HasForeignKey(s => s.TopicId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Progress>().ToTable("Progresses");
            modelBuilder.Entity<Achievement>().ToTable("Achievements");
            modelBuilder.Entity<UserAchievement>().ToTable("UserAchievements");
            modelBuilder.Entity<Topic>().ToTable("Topics");
            modelBuilder.Entity<Suggestion>().ToTable("Suggestions");
        }
        
    }
}
