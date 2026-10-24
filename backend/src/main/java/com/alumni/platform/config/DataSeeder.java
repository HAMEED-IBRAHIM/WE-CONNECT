package com.alumni.platform.config;

import com.alumni.platform.model.*;
import com.alumni.platform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                      PostRepository postRepository,
                                      CommentRepository commentRepository,
                                      JobRepository jobRepository,
                                      ConnectionRepository connectionRepository,
                                      MessageRepository messageRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@weconnect.com").isPresent()) {
                System.out.println("✅ Database already seeded. Ready.");
                return;
            }
            System.out.println("🔧 Seeding WE-CONNECT with rich real-world data & avatars...");

            // ========== ADMIN ==========
            User admin = new User();
            admin.setFirstName("Ibrahim");
            admin.setLastName("Hameed");
            admin.setUsername("ibrahim_admin");
            admin.setEmail("admin@weconnect.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setVerificationStatus(VerificationStatus.APPROVED);
            admin.setJobTitle("Platform Founder");
            admin.setCompany("WE-CONNECT");
            admin.setLocation("Bangalore, India");
            admin.setBio("Building the future of alumni networking. WE-CONNECT brings graduates, recruiters, and students together into an elite ecosystem.");
            admin.setDepartment("Computer Science");
            admin.setDegree("B.Tech");
            admin.setGraduationYear("2024");
            admin.setProfilePicture("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80");
            userRepository.save(admin);

            // ========== ALUMNI (REAL PROFILES) ==========
            User alumni1 = createUser("Priya", "Sharma", "priya.sharma", "priya.sharma@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "Senior Software Engineer", "Google",
                "Bangalore, India", "Full-stack engineer on Google Cloud & Kubernetes. Ex-Amazon. Mentor to 50+ students. Passionate about system design & cloud architecture.",
                "Computer Science", "B.Tech", "2020", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni1);

            User alumni2 = createUser("Rahul", "Verma", "rahul.verma", "rahul.verma@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "Lead Product Manager", "Microsoft",
                "Hyderabad, India", "Leading AI & Copilot initiatives across Microsoft 365. 5+ years driving user growth for 15M+ active users. Always open to discuss product strategy.",
                "Information Technology", "M.Tech", "2019", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni2);

            User alumni3 = createUser("Aisha", "Khan", "aisha.khan", "aisha.khan@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "Senior Data Scientist", "Netflix",
                "Mumbai, India", "Machine learning researcher focused on deep recommendation engines and ranking algorithms. 3 NeurIPS papers. Host of weekly ML study circles.",
                "Data Science", "M.Sc", "2021", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni3);

            User alumni4 = createUser("Arjun", "Nair", "arjun.nair", "arjun.nair@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "Principal DevOps Architect", "Flipkart",
                "Chennai, India", "High-scale cloud infrastructure builder. Architected Big Billion Days infra handling 120M concurrent requests. Terraform & Kubernetes enthusiast.",
                "Computer Science", "B.Tech", "2018", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni4);

            User alumni5 = createUser("Sneha", "Reddy", "sneha.reddy", "sneha.reddy@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "Staff UX Design Lead", "Swiggy",
                "Bangalore, India", "Design systems lead. Scaled Swiggy's consumer app design tokens used across 12 product squads. Advocate for accessibility & micro-interactions.",
                "Design", "B.Des", "2020", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni5);

            User alumni6 = createUser("Vikram", "Patel", "vikram.patel", "vikram.patel@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "CTO & Co-Founder", "HealthTech AI",
                "Pune, India", "Second-time founder. Raised $5M Series A for clinical diagnostic AI in rural healthcare. Passionate about hiring top alumni engineering talent.",
                "Computer Science", "B.Tech", "2016", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni6);

            User alumni7 = createUser("Meera", "Joshi", "meera.joshi", "meera.joshi@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "Cloud Security Architect", "Deloitte",
                "Delhi, India", "CISSP certified security consultant defending multi-cloud environments. Red-teaming, zero-trust architecture, and compliance specialist.",
                "Information Security", "M.Tech", "2021", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni7);

            User alumni8 = createUser("Karthik", "Subramanian", "karthik.s", "karthik.s@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_ALUMNI, "Applied AI Scientist", "Amazon",
                "Bangalore, India", "Building conversational foundation models for Alexa and multilingual voice agents. 4 filed patents in generative speech synthesis.",
                "AI & ML", "M.Tech", "2019", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80");
            userRepository.save(alumni8);

            // ========== STUDENTS ==========
            User student1 = createUser("Ananya", "Gupta", "ananya.g", "ananya.gupta@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_STUDENT, "Software Engineering Intern", "Razorpay",
                "Bangalore, India", "Final year CS student focusing on backend distributed systems, Golang, and event queues. Seeking 2025 new grad SDE opportunities.",
                "Computer Science", "B.Tech", "2025", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80");
            userRepository.save(student1);

            User student2 = createUser("Mohammed", "Faisal", "mohammed.f", "mohammed.faisal@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_STUDENT, "Research Fellow", "IISc Bangalore",
                "Bangalore, India", "Pre-final year researcher working on federated deep learning & privacy preserving ML. Contributor to PyTorch open source.",
                "Data Science", "B.Tech", "2026", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80");
            userRepository.save(student2);

            User student3 = createUser("Riya", "Chopra", "riya.chopra", "riya.chopra@gmail.com",
                passwordEncoder.encode("password"), Role.ROLE_STUDENT, "Lead Ambassador", "Google DSC",
                "Pune, India", "Open source enthusiast with 70+ GitHub commits. Led 3 university hackathons with 1,200+ attendees. Aspiring frontend architect.",
                "Information Technology", "B.Tech", "2025", VerificationStatus.APPROVED,
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80");
            userRepository.save(student3);

            // ========== CONNECTIONS ==========
            // Priya <-> Admin (Accepted)
            Connection conn1 = new Connection();
            conn1.setRequester(alumni1);
            conn1.setRecipient(admin);
            conn1.setStatus(ConnectionStatus.ACCEPTED);
            connectionRepository.save(conn1);

            // Aisha <-> Admin (Accepted)
            Connection conn2 = new Connection();
            conn2.setRequester(alumni3);
            conn2.setRecipient(admin);
            conn2.setStatus(ConnectionStatus.ACCEPTED);
            connectionRepository.save(conn2);

            // Rahul -> Admin (Pending incoming request for Admin to Accept/Decline)
            Connection conn3 = new Connection();
            conn3.setRequester(alumni2);
            conn3.setRecipient(admin);
            conn3.setStatus(ConnectionStatus.PENDING);
            connectionRepository.save(conn3);

            // Admin -> Vikram (Sent request awaiting Vikram's response)
            Connection conn4 = new Connection();
            conn4.setRequester(admin);
            conn4.setRecipient(alumni6);
            conn4.setStatus(ConnectionStatus.PENDING);
            connectionRepository.save(conn4);

            // Priya <-> Ananya (Accepted)
            Connection conn5 = new Connection();
            conn5.setRequester(student1);
            conn5.setRecipient(alumni1);
            conn5.setStatus(ConnectionStatus.ACCEPTED);
            connectionRepository.save(conn5);

            // ========== MESSAGES ==========
            Message m1 = new Message();
            m1.setSender(alumni1);
            m1.setRecipient(admin);
            m1.setContent("Hi Ibrahim! Great to connect with you. How is your project coming along?");
            m1.setRead(true);
            m1.setCreatedAt(LocalDateTime.now().minusHours(3));
            messageRepository.save(m1);

            Message m2 = new Message();
            m2.setSender(admin);
            m2.setRecipient(alumni1);
            m2.setContent("Thanks Priya! Moving fast, building the verified networking & job referral platform.");
            m2.setRead(true);
            m2.setCreatedAt(LocalDateTime.now().minusHours(2));
            messageRepository.save(m2);

            Message m3 = new Message();
            m3.setSender(alumni1);
            m3.setRecipient(admin);
            m3.setContent("Love the concept! Let me know if you ever need any referrals or want to collaborate on a system design workshop for students.");
            m3.setRead(false);
            m3.setCreatedAt(LocalDateTime.now().minusMinutes(25));
            messageRepository.save(m3);

            Message m4 = new Message();
            m4.setSender(alumni3);
            m4.setRecipient(admin);
            m4.setContent("Hey Ibrahim! We just announced our 12-week ML study group. Would love to have your team spotlight it!");
            m4.setRead(false);
            m4.setCreatedAt(LocalDateTime.now().minusHours(1));
            messageRepository.save(m4);

            // ========== POSTS ==========
            Post post1 = new Post();
            post1.setTitle("How I Cracked Google's L4 Interview in 3 Months (Complete Framework)");
            post1.setContent("After 2 failed attempts, I finally made it to Google. Here is the exact blueprint that made the difference:\n\n1. **Data Structures & Algorithms**: Mastered 12 core patterns (Sliding Window, Two Pointers, Monotonic Stack, Top-K Elements) rather than blind problem counts.\n2. **System Design**: Practiced Alex Xu's System Design Interview Vol 1 & 2 + deep-dived into Kafka & Cassandra internals.\n3. **Behavioral (Googleyness)**: Drafted 15 STAR stories reflecting ownership, ambiguity management, and unblocking teammates.\n4. **Mock Interviews**: Did 20+ live mock sessions with industry peers.\n\nThe real secret? Stop memorizing solutions. Focus on communication and tradeoff analysis. Happy to refer qualified alumni — leave a comment below!");
            post1.setAuthor(alumni1);
            post1.setPublished(true);
            post1.setTags("interview,google,career,dsa,mentorship");
            postRepository.save(post1);

            Post post2 = new Post();
            post2.setTitle("Why Every Senior Engineer Should Understand Product Management");
            post2.setContent("I transitioned from SDE to Product Manager at Microsoft, and it completely redefined how I evaluate technical ROI.\n\nAs an engineer, I used to optimize for clean code and perfect architecture. As a PM, I realized that shipping 2 weeks earlier to validate a customer hypothesis often yields 10x higher impact.\n\nKey skills that carried over:\n• Analytical precision → Translating metrics into product specs\n• Technical architecture → Realistic scoping and engineering empathy\n• Root-cause debugging → Deep customer problem discovery\n\nIf you want to move into Tech Lead or PM roles, start by joining customer feedback calls and understanding the unit economics of your feature.");
            post2.setAuthor(alumni2);
            post2.setPublished(true);
            post2.setTags("product-management,career-switch,leadership,microsoft");
            postRepository.save(post2);

            Post post3 = new Post();
            post3.setTitle("🚀 We Just Raised $5M Series A — And We're Hiring Across Engineering!");
            post3.setContent("Huge milestone for the HealthTech AI team! We just closed our $5M Series A round led by top healthcare funds. Our automated diagnostic models are now live across 50+ rural clinics helping doctors detect early abnormalities in minutes.\n\nWe are hiring immediately for:\n• Senior Full-Stack Engineers (React + FastAPI) — ₹30-45 LPA\n• ML Engineers (Computer Vision & Medical Imaging) — ₹35-55 LPA\n• Staff Product Designer — ₹28-40 LPA\n\nAlumni from our network receive priority interviews and direct hiring manager reviews. Check our Jobs tab or send me a direct connection request!");
            post3.setAuthor(alumni6);
            post3.setPublished(true);
            post3.setTags("hiring,startup,healthtech,series-a,jobs");
            postRepository.save(post3);

            Post post4 = new Post();
            post4.setTitle("Free 12-Week Machine Learning & AI Study Group — Cohort 3 Now Open!");
            post4.setContent("Excited to launch Cohort 3 of our free weekend ML study group designed for university students and early-career software engineers.\n\nSyllabus:\n• Weeks 1-4: Linear algebra, multivariable calculus & NumPy implementations\n• Weeks 5-8: Classical ML algorithms from scratch (Trees, Ensembles, SVMs)\n• Weeks 9-12: Transformer architectures, Attention mechanisms & PyTorch fine-tuning\n\nIncludes 1 research paper breakdown per week and 2 portfolio-ready capstones. Comment 'Interested' below to receive the calendar invite!");
            post4.setAuthor(alumni3);
            post4.setPublished(true);
            post4.setTags("machine-learning,study-group,education,ai,datascience");
            postRepository.save(post4);

            // ========== REAL JOBS WITH SALARY & DIRECT APPLY LINKS ==========
            Job job1 = new Job();
            job1.setTitle("Software Development Engineer II — Cloud Platform");
            job1.setCompany("Google");
            job1.setLocation("Bangalore, India (Hybrid)");
            job1.setType("Full-time");
            job1.setDescription("💰 ₹45,00,000 - ₹65,00,000 / year + RSUs + Benefits\n\nJoin Google Cloud Platform core infrastructure team. You will design and implement resilient, distributed control planes that orchestrate Kubernetes clusters at planetary scale.\n\nRequirements:\n• 3+ years experience with Go, Java, or C++ in production\n• Deep understanding of distributed consensus, gRPC, and microservices\n• Experience with container runtime engines and Linux networking\n• B.Tech/M.Tech in CS or related field");
            job1.setApplyLink("https://careers.google.com/jobs/results/?q=software%20engineer&location=Bangalore");
            job1.setAuthor(alumni1);
            jobRepository.save(job1);

            Job job2 = new Job();
            job2.setTitle("Senior Product Manager — Copilot & Generative AI");
            job2.setCompany("Microsoft");
            job2.setLocation("Hyderabad, India (Hybrid)");
            job2.setType("Full-time");
            job2.setDescription("💰 ₹42,00,000 - ₹60,00,000 / year + Performance Bonus\n\nDefine the future of intelligent enterprise productivity. You will partner with Azure OpenAI researchers and engineering leaders to integrate LLM capabilities into Microsoft 365.\n\nRequirements:\n• 4+ years product management experience in SaaS or AI platforms\n• Proven track record defining product requirements for high-scale applications\n• Exceptional analytical and user experience evaluation skills");
            job2.setApplyLink("https://careers.microsoft.com/v2/global/en/search?q=product%20manager&l=India");
            job2.setAuthor(alumni2);
            jobRepository.save(job2);

            Job job3 = new Job();
            job3.setTitle("Founding Full-Stack Engineer (React + Python)");
            job3.setCompany("HealthTech AI");
            job3.setLocation("Pune, India (Remote OK)");
            job3.setType("Full-time");
            job3.setDescription("💰 ₹28,00,000 - ₹42,00,000 / year + 0.5% - 1.0% Equity\n\nDirectly shape our core clinical diagnostic portal. You'll build lightning-fast web applications in React & TypeScript backed by high-throughput FastAPI microservices.\n\nRequirements:\n• 2+ years building web applications with modern React and Python\n• Experience with PostgreSQL, Redis, and WebSocket streaming\n• High autonomy and startup passion — ability to ship weekly");
            job3.setApplyLink("https://www.linkedin.com/jobs/search/?keywords=full%20stack%20engineer&location=India");
            job3.setAuthor(alumni6);
            jobRepository.save(job3);

            Job job4 = new Job();
            job4.setTitle("Data Science & Recommendation Systems Intern");
            job4.setCompany("Netflix");
            job4.setLocation("Mumbai, India");
            job4.setType("Internship");
            job4.setDescription("💰 ₹1,25,000 / month Stipend + Housing Allowance\n\nSummer 2025 Internship. Join the personalization algorithms team to prototype multi-modal recommendation models for 260M+ members globally.\n\nRequirements:\n• Enrolled in Master's or PhD program in CS, Statistics, or Machine Learning\n• Strong fluency in Python, PyTorch, and SQL\n• Knowledge of collaborative filtering and transformer ranking architectures");
            job4.setApplyLink("https://jobs.netflix.com/search?q=data%20science%20intern");
            job4.setAuthor(alumni3);
            jobRepository.save(job4);

            Job job5 = new Job();
            job5.setTitle("Lead DevOps & Infrastructure Engineer");
            job5.setCompany("Flipkart");
            job5.setLocation("Bangalore, India");
            job5.setType("Full-time");
            job5.setDescription("💰 ₹35,00,000 - ₹52,00,000 / year + Stock Incentives\n\nArchitect automated zero-downtime deployment pipelines and multi-region Kubernetes clusters for India's leading e-commerce ecosystem.\n\nRequirements:\n• 4+ years running high-availability cloud infrastructure\n• Mastery of Terraform, Kubernetes, Helm, and CI/CD pipelines\n• Strong background in observability (Prometheus, Grafana, OpenTelemetry)");
            job5.setApplyLink("https://www.flipkartcareers.com/#!/joblist");
            job5.setAuthor(alumni4);
            jobRepository.save(job5);

            Job job6 = new Job();
            job6.setTitle("Staff Product Designer — Design Systems");
            job6.setCompany("Swiggy");
            job6.setLocation("Bangalore, India (Hybrid)");
            job6.setType("Full-time");
            job6.setDescription("💰 ₹30,00,000 - ₹45,00,000 / year + Meal Perks\n\nLead the visual and interaction foundations of Swiggy's design system across iOS, Android, and Web serving 30M+ monthly food & grocery shoppers.\n\nRequirements:\n• 4+ years specialized in product design and design systems\n• Figma mastery including auto-layout, variables, and token sync\n• Outstanding portfolio showcasing mobile-first customer experiences");
            job6.setApplyLink("https://careers.swiggy.com/#/careers?src=homepage");
            job6.setAuthor(alumni5);
            jobRepository.save(job6);

            Job job7 = new Job();
            job7.setTitle("Cloud Security & Penetration Testing Specialist");
            job7.setCompany("Deloitte");
            job7.setLocation("Delhi, India");
            job7.setType("Full-time");
            job7.setDescription("💰 ₹24,00,000 - ₹38,00,000 / year + Comprehensive Benefits\n\nConduct adversary emulation, vulnerability assessments, and cloud security architecture reviews for global enterprise clients.\n\nRequirements:\n• CEH, OSCP, or AWS Certified Security Specialty\n• Practical knowledge of threat modeling, SIEM, and incident response\n• Hands-on scripting in Python or Bash for security tooling");
            job7.setApplyLink("https://apply.deloitte.com/careers/SearchJobs/cyber%20security?sort=relevancy&orgIds=1");
            job7.setAuthor(alumni7);
            jobRepository.save(job7);

            Job job8 = new Job();
            job8.setTitle("Machine Learning Engineer — Conversational NLU");
            job8.setCompany("Amazon");
            job8.setLocation("Bangalore, India");
            job8.setType("Full-time");
            job8.setDescription("💰 ₹40,00,000 - ₹58,00,000 / year + Sign-on Bonus\n\nDevelop state-of-the-art transformer models powering intent detection, slot filling, and contextual dialogue for the next generation of Alexa.\n\nRequirements:\n• M.Tech or PhD in CS with focus on NLP or Deep Learning\n• 2+ years taking machine learning models into production inference\n• Expertise in PyTorch, TensorRT, and distributed model training");
            job8.setApplyLink("https://www.amazon.jobs/en/search?base_query=machine+learning+engineer&loc_query=Bangalore");
            job8.setAuthor(alumni8);
            jobRepository.save(job8);

            // ========== COMMENTS ==========
            Comment c1 = new Comment();
            c1.setPost(post1);
            c1.setAuthor(student1);
            c1.setContent("This breakdown is incredible, Priya! Especially the 12 patterns insight. Did you prepare system design concurrently with DSA or in separate phases?");
            commentRepository.save(c1);

            Comment c2 = new Comment();
            c2.setPost(post1);
            c2.setAuthor(alumni2);
            c2.setContent("Spot on, Priya! For system design, also make sure candidates practice drawing diagrams live under 35 minutes. Crucial for L4/L5 loops.");
            commentRepository.save(c2);

            Comment c3 = new Comment();
            c3.setPost(post3);
            c3.setAuthor(student3);
            c3.setContent("Huge congrats Vikram! 🎉 Just submitted my application through the jobs link. Really inspired by the rural clinic mission!");
            commentRepository.save(c3);

            Comment c4 = new Comment();
            c4.setPost(post4);
            c4.setAuthor(student2);
            c4.setContent("Interested! I've been reading the original Attention Is All You Need paper and would love to join the group discussions.");
            commentRepository.save(c4);

            System.out.println("✅ WE-CONNECT seeded: 12 users with avatars, 5 connections, 4 messages, 4 posts, 8 jobs with salaries, 4 comments");
        };
    }

    private User createUser(String firstName, String lastName, String username, String email,
                           String password, Role role, String jobTitle, String company,
                           String location, String bio, String department, String degree,
                           String gradYear, VerificationStatus vs, String profilePicture) {
        User u = new User();
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        u.setJobTitle(jobTitle);
        u.setCompany(company);
        u.setLocation(location);
        u.setBio(bio);
        u.setDepartment(department);
        u.setDegree(degree);
        u.setGraduationYear(gradYear);
        u.setVerificationStatus(vs);
        u.setProfilePicture(profilePicture);
        return u;
    }
}
