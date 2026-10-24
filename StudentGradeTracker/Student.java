/**
 * Student.java
 *
 * Represents a single student record containing:
 *   - Student ID  (String)
 *   - Student Name (String)
 *   - Score (double, 0–100)
 *
 * Also provides a method to calculate the letter grade
 * based on the score using the defined grading scale.
 */
public class Student {

    // -------------------------------------------------------
    // Fields
    // -------------------------------------------------------
    private String studentId;   // Unique identifier for each student
    private String name;        // Full name of the student
    private double score;       // Score between 0.0 and 100.0

    // -------------------------------------------------------
    // Constructor
    // -------------------------------------------------------

    /**
     * Creates a new Student with the given ID, name, and score.
     *
     * @param studentId Unique student identifier
     * @param name      Student's full name
     * @param score     Score between 0.0 and 100.0
     */
    public Student(String studentId, String name, double score) {
        this.studentId = studentId;
        this.name      = name;
        this.score     = score;
    }

    // -------------------------------------------------------
    // Getters
    // -------------------------------------------------------

    /** Returns the student's unique ID. */
    public String getStudentId() {
        return studentId;
    }

    /** Returns the student's full name. */
    public String getName() {
        return name;
    }

    /** Returns the student's score. */
    public double getScore() {
        return score;
    }

    // -------------------------------------------------------
    // Setters
    // -------------------------------------------------------

    /** Updates the student's name. */
    public void setName(String name) {
        this.name = name;
    }

    /** Updates the student's score. */
    public void setScore(double score) {
        this.score = score;
    }

    // -------------------------------------------------------
    // Grade Calculation
    // -------------------------------------------------------

    /**
     * Returns the letter grade for this student based on their score.
     *
     * Grading scale:
     *   90 – 100   → A+
     *   80 – 89.99 → A
     *   70 – 79.99 → B
     *   60 – 69.99 → C
     *   50 – 59.99 → D
     *    0 – 49.99 → F
     *
     * @return Letter grade as a String
     */
    public String getGrade() {
        if (score >= 90.0) {
            return "A+";
        } else if (score >= 80.0) {
            return "A";
        } else if (score >= 70.0) {
            return "B";
        } else if (score >= 60.0) {
            return "C";
        } else if (score >= 50.0) {
            return "D";
        } else {
            return "F";
        }
    }

    // -------------------------------------------------------
    // toString (useful for quick debugging)
    // -------------------------------------------------------

    /**
     * Returns a brief text representation of this student.
     */
    @Override
    public String toString() {
        return String.format("Student[ID=%s, Name=%s, Score=%.2f, Grade=%s]",
                studentId, name, score, getGrade());
    }
}
