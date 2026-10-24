import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * StudentGradeTracker.java
 *
 * Main application class for the Student Grade Tracker.
 *
 * Features:
 *  1. Add Student
 *  2. View All Students
 *  3. Calculate Average Score
 *  4. Find Highest Score
 *  5. Find Lowest Score
 *  6. Generate Summary Report
 *  7. Search Student by ID
 *  8. Update Student Grade
 *  9. Delete Student
 * 10. Exit
 *
 * All student data is held in memory using an ArrayList<Student>.
 * No database or file I/O is required.
 */
public class StudentGradeTracker {

    // -------------------------------------------------------
    // Data Store
    // -------------------------------------------------------

    /**
     * Central list that holds every student added during this session.
     * ArrayList lets us add/remove students easily without a fixed size.
     */
    private static ArrayList<Student> students = new ArrayList<>();

    // Shared Scanner – opened once and reused throughout the program.
    private static Scanner scanner = new Scanner(System.in);

    // -------------------------------------------------------
    // Entry Point
    // -------------------------------------------------------

    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("   Welcome to Student Grade Tracker     ");
        System.out.println("========================================");

        // Keep showing the menu until the user chooses Exit (option 10).
        boolean running = true;
        while (running) {
            displayMenu();
            int choice = readMenuChoice();

            switch (choice) {
                case 1  -> addStudent();
                case 2  -> viewAllStudents();
                case 3  -> calculateAverageScore();
                case 4  -> findHighestScore();
                case 5  -> findLowestScore();
                case 6  -> generateSummaryReport();
                case 7  -> searchStudentById();
                case 8  -> updateStudentGrade();
                case 9  -> deleteStudent();
                case 10 -> {
                    System.out.println("\nThank you for using Student Grade Tracker. Goodbye!");
                    running = false;
                }
                default -> System.out.println("\n[!] Invalid choice. Please enter a number between 1 and 10.");
            }
        }

        scanner.close();
    }

    // -------------------------------------------------------
    // Menu Display
    // -------------------------------------------------------

    /** Prints the main menu to the console. */
    private static void displayMenu() {
        System.out.println();
        System.out.println("========================================");
        System.out.println("        STUDENT GRADE TRACKER          ");
        System.out.println("========================================");
        System.out.println("  1. Add Student");
        System.out.println("  2. View All Students");
        System.out.println("  3. Calculate Average Score");
        System.out.println("  4. Find Highest Score");
        System.out.println("  5. Find Lowest Score");
        System.out.println("  6. Generate Summary Report");
        System.out.println("  7. Search Student by ID");
        System.out.println("  8. Update Student Grade");
        System.out.println("  9. Delete Student");
        System.out.println(" 10. Exit");
        System.out.println("========================================");
        System.out.print("Enter your choice: ");
    }

    /**
     * Reads the user's menu choice.
     * Returns -1 if the input is not a valid integer,
     * which causes the switch statement to hit the default (invalid) branch.
     */
    private static int readMenuChoice() {
        String input = scanner.nextLine().trim();
        try {
            return Integer.parseInt(input);
        } catch (NumberFormatException e) {
            // Non-integer input – return sentinel value to trigger "Invalid choice" message.
            return -1;
        }
    }

    // -------------------------------------------------------
    // Feature 1 – Add Student
    // -------------------------------------------------------

    /**
     * Prompts the user to enter a student ID, name, and score.
     * Validates every field and rejects duplicates.
     * On success, adds the student to the list and confirms.
     */
    private static void addStudent() {
        System.out.println("\n--- Add Student ---");

        // --- Student ID ---
        String studentId = readStudentId(true);  // true = must be unique

        // --- Student Name ---
        String name = readStudentName();

        // --- Score ---
        double score = readScore();

        // All fields are valid; create and store the student.
        Student student = new Student(studentId, name, score);
        students.add(student);

        System.out.println("\n[✓] Student added successfully!");
        System.out.printf("    ID: %s | Name: %s | Score: %.2f | Grade: %s%n",
                student.getStudentId(), student.getName(),
                student.getScore(), student.getGrade());
    }

    // -------------------------------------------------------
    // Feature 2 – View All Students
    // -------------------------------------------------------

    /**
     * Displays all students in a formatted table.
     * Shows an informative message when no students have been added.
     */
    private static void viewAllStudents() {
        System.out.println("\n--- All Students ---");

        if (students.isEmpty()) {
            System.out.println("No students have been added yet.");
            return;
        }

        printTableHeader();
        for (Student s : students) {
            printStudentRow(s);
        }
        printTableDivider();
        System.out.printf("  Total students: %d%n", students.size());
    }

    // -------------------------------------------------------
    // Feature 3 – Calculate Average Score
    // -------------------------------------------------------

    /**
     * Calculates and displays the average score of all students.
     * Guards against division by zero when no students exist.
     */
    private static void calculateAverageScore() {
        System.out.println("\n--- Average Score ---");

        if (students.isEmpty()) {
            System.out.println("No students available. Add students first.");
            return;
        }

        double average = computeAverage();
        System.out.printf("Average score of %d student(s): %.2f%n",
                students.size(), average);
    }

    // -------------------------------------------------------
    // Feature 4 – Find Highest Score
    // -------------------------------------------------------

    /**
     * Finds the highest score and lists every student who achieved it.
     * Handles ties by collecting all matching students.
     */
    private static void findHighestScore() {
        System.out.println("\n--- Highest Score ---");

        if (students.isEmpty()) {
            System.out.println("No students available. Add students first.");
            return;
        }

        double highest = computeHighest();
        List<Student> topStudents = getStudentsWithScore(highest);

        System.out.printf("Highest score: %.2f%n", highest);
        System.out.println("Student(s) with the highest score:");
        for (Student s : topStudents) {
            System.out.printf("  - %s (ID: %s)%n", s.getName(), s.getStudentId());
        }
    }

    // -------------------------------------------------------
    // Feature 5 – Find Lowest Score
    // -------------------------------------------------------

    /**
     * Finds the lowest score and lists every student who achieved it.
     * Handles ties by collecting all matching students.
     */
    private static void findLowestScore() {
        System.out.println("\n--- Lowest Score ---");

        if (students.isEmpty()) {
            System.out.println("No students available. Add students first.");
            return;
        }

        double lowest = computeLowest();
        List<Student> bottomStudents = getStudentsWithScore(lowest);

        System.out.printf("Lowest score: %.2f%n", lowest);
        System.out.println("Student(s) with the lowest score:");
        for (Student s : bottomStudents) {
            System.out.printf("  - %s (ID: %s)%n", s.getName(), s.getStudentId());
        }
    }

    // -------------------------------------------------------
    // Feature 6 – Generate Summary Report
    // -------------------------------------------------------

    /**
     * Generates a full summary report that includes:
     *  - Total students
     *  - Full student list with grades
     *  - Average, highest, and lowest scores
     *  - Count of students per grade category
     */
    private static void generateSummaryReport() {
        System.out.println("\n========================================");
        System.out.println("         SUMMARY REPORT                ");
        System.out.println("========================================");

        if (students.isEmpty()) {
            System.out.println("No students registered yet.");
            System.out.println("Please add students before generating a report.");
            System.out.println("========================================");
            return;
        }

        // --- Total students ---
        System.out.printf("Total Students  : %d%n", students.size());

        // --- Full student list ---
        System.out.println();
        printTableHeader();
        for (Student s : students) {
            printStudentRow(s);
        }
        printTableDivider();

        // --- Statistics ---
        double average = computeAverage();
        double highest = computeHighest();
        double lowest  = computeLowest();

        System.out.printf("%nAverage Score   : %.2f%n", average);

        System.out.printf("Highest Score   : %.2f  -->  ", highest);
        List<Student> topStudents = getStudentsWithScore(highest);
        System.out.println(joinNames(topStudents));

        System.out.printf("Lowest Score    : %.2f  -->  ", lowest);
        List<Student> bottomStudents = getStudentsWithScore(lowest);
        System.out.println(joinNames(bottomStudents));

        // --- Grade distribution ---
        System.out.println("\nGrade Distribution:");
        int[] counts = computeGradeCounts();
        // counts[0]=A+, [1]=A, [2]=B, [3]=C, [4]=D, [5]=F
        String[] gradeLabels = {"A+", "A ", "B ", "C ", "D ", "F "};
        for (int i = 0; i < gradeLabels.length; i++) {
            System.out.printf("  Grade %s : %d student(s)%n", gradeLabels[i], counts[i]);
        }

        System.out.println("========================================");
    }

    // -------------------------------------------------------
    // Feature 7 – Search Student by ID
    // -------------------------------------------------------

    /**
     * Asks the user for a student ID and prints full details if found.
     * Displays a clear message when no match exists.
     */
    private static void searchStudentById() {
        System.out.println("\n--- Search Student by ID ---");
        System.out.print("Enter Student ID to search: ");
        String id = scanner.nextLine().trim();

        Student found = findById(id);
        if (found == null) {
            System.out.printf("No student found with ID: %s%n", id);
        } else {
            System.out.println("\nStudent found:");
            printTableHeader();
            printStudentRow(found);
            printTableDivider();
        }
    }

    // -------------------------------------------------------
    // Feature 8 – Update Student Grade
    // -------------------------------------------------------

    /**
     * Allows the user to change a student's score.
     * Validates the new score; rejects scores outside 0–100.
     * All downstream statistics automatically reflect the update
     * because they are computed on demand from the live list.
     */
    private static void updateStudentGrade() {
        System.out.println("\n--- Update Student Grade ---");
        System.out.print("Enter Student ID to update: ");
        String id = scanner.nextLine().trim();

        Student found = findById(id);
        if (found == null) {
            System.out.printf("No student found with ID: %s%n", id);
            return;
        }

        System.out.printf("Current score for %s (ID: %s): %.2f (Grade: %s)%n",
                found.getName(), found.getStudentId(),
                found.getScore(), found.getGrade());

        double newScore = readScore();          // Validates 0–100
        found.setScore(newScore);              // Update in-place (no duplicate)

        System.out.println("\n[✓] Score updated successfully!");
        System.out.printf("    %s | New Score: %.2f | New Grade: %s%n",
                found.getName(), found.getScore(), found.getGrade());
    }

    // -------------------------------------------------------
    // Feature 9 – Delete Student
    // -------------------------------------------------------

    /**
     * Removes a student from the list by their ID.
     * Confirms success or reports if the ID was not found.
     */
    private static void deleteStudent() {
        System.out.println("\n--- Delete Student ---");
        System.out.print("Enter Student ID to delete: ");
        String id = scanner.nextLine().trim();

        // Iterate through the list to find and remove the matching student.
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getStudentId().equalsIgnoreCase(id)) {
                Student removed = students.remove(i);
                System.out.printf("\n[✓] Student '%s' (ID: %s) deleted successfully.%n",
                        removed.getName(), removed.getStudentId());
                return;
            }
        }

        System.out.printf("No student found with ID: %s%n", id);
    }

    // -------------------------------------------------------
    // Input Helpers
    // -------------------------------------------------------

    /**
     * Reads and validates a student ID from the user.
     *
     * @param mustBeUnique If true, the ID must not already exist in the list.
     * @return A validated, non-empty student ID string.
     */
    private static String readStudentId(boolean mustBeUnique) {
        while (true) {
            System.out.print("Enter Student ID: ");
            String id = scanner.nextLine().trim();

            if (id.isEmpty()) {
                System.out.println("[!] Student ID cannot be empty. Please try again.");
                continue;
            }

            if (mustBeUnique && findById(id) != null) {
                System.out.printf("[!] Student ID '%s' already exists. Please enter a unique ID.%n", id);
                continue;
            }

            return id;  // Valid
        }
    }

    /**
     * Reads and validates a student name.
     * The name must not be blank.
     *
     * @return A non-empty name string.
     */
    private static String readStudentName() {
        while (true) {
            System.out.print("Enter Student Name: ");
            String name = scanner.nextLine().trim();

            if (name.isEmpty()) {
                System.out.println("[!] Student name cannot be empty. Please try again.");
                continue;
            }

            return name;  // Valid
        }
    }

    /**
     * Reads and validates a numeric score between 0.0 and 100.0 (inclusive).
     * Re-prompts on non-numeric input, negative values, or values above 100.
     * Supports decimal values such as 87.5.
     *
     * @return A valid score as a double.
     */
    private static double readScore() {
        while (true) {
            System.out.print("Enter Score (0 – 100): ");
            String input = scanner.nextLine().trim();

            double score;
            try {
                score = Double.parseDouble(input);
            } catch (NumberFormatException e) {
                System.out.println("[!] Invalid input. Score must be a number. Please try again.");
                continue;
            }

            if (score < 0.0 || score > 100.0) {
                System.out.println("[!] Score must be between 0 and 100. Please try again.");
                continue;
            }

            return score;  // Valid
        }
    }

    // -------------------------------------------------------
    // Lookup Helper
    // -------------------------------------------------------

    /**
     * Searches the student list for a student with the given ID.
     * Comparison is case-insensitive for convenience.
     *
     * @param id The student ID to look for.
     * @return The matching Student, or null if not found.
     */
    private static Student findById(String id) {
        for (Student s : students) {
            if (s.getStudentId().equalsIgnoreCase(id)) {
                return s;
            }
        }
        return null;
    }

    // -------------------------------------------------------
    // Statistical Helpers
    // -------------------------------------------------------

    /**
     * Computes the average score of all students.
     * Precondition: students list must not be empty.
     */
    private static double computeAverage() {
        double sum = 0.0;
        for (Student s : students) {
            sum += s.getScore();
        }
        return sum / students.size();
    }

    /**
     * Returns the highest score found in the student list.
     * Precondition: students list must not be empty.
     */
    private static double computeHighest() {
        double max = students.get(0).getScore();
        for (Student s : students) {
            if (s.getScore() > max) {
                max = s.getScore();
            }
        }
        return max;
    }

    /**
     * Returns the lowest score found in the student list.
     * Precondition: students list must not be empty.
     */
    private static double computeLowest() {
        double min = students.get(0).getScore();
        for (Student s : students) {
            if (s.getScore() < min) {
                min = s.getScore();
            }
        }
        return min;
    }

    /**
     * Collects all students whose score exactly matches the given value.
     * Used to handle ties in highest / lowest score queries.
     *
     * @param targetScore The score to match.
     * @return List of matching students (never null; may be empty).
     */
    private static List<Student> getStudentsWithScore(double targetScore) {
        List<Student> result = new ArrayList<>();
        for (Student s : students) {
            if (s.getScore() == targetScore) {
                result.add(s);
            }
        }
        return result;
    }

    /**
     * Counts students per grade category.
     *
     * @return int[6] where index 0=A+, 1=A, 2=B, 3=C, 4=D, 5=F
     */
    private static int[] computeGradeCounts() {
        int[] counts = new int[6];
        for (Student s : students) {
            switch (s.getGrade()) {
                case "A+" -> counts[0]++;
                case "A"  -> counts[1]++;
                case "B"  -> counts[2]++;
                case "C"  -> counts[3]++;
                case "D"  -> counts[4]++;
                case "F"  -> counts[5]++;
            }
        }
        return counts;
    }

    // -------------------------------------------------------
    // Display Helpers
    // -------------------------------------------------------

    /** Prints the table header row. */
    private static void printTableHeader() {
        printTableDivider();
        System.out.printf("| %-10s | %-20s | %-7s | %-5s |%n",
                "Student ID", "Name", "Score", "Grade");
        printTableDivider();
    }

    /** Prints a single student row in the table. */
    private static void printStudentRow(Student s) {
        System.out.printf("| %-10s | %-20s | %-7.2f | %-5s |%n",
                s.getStudentId(), s.getName(), s.getScore(), s.getGrade());
    }

    /** Prints the horizontal divider line used in the table. */
    private static void printTableDivider() {
        System.out.println("+------------+----------------------+---------+-------+");
    }

    /**
     * Builds a comma-separated string of student names for display.
     *
     * @param list List of students to join.
     * @return e.g. "Arun, Priya"
     */
    private static String joinNames(List<Student> list) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            sb.append(list.get(i).getName());
            if (i < list.size() - 1) {
                sb.append(", ");
            }
        }
        return sb.toString();
    }
}
