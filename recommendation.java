import java.util.*;
import com.sun.net.httpserver.*;
import java.io.*;

public class recommendation {

    // Store topics by subject+level
    static HashMap<String, List<String>> subjectTopics = new HashMap<>();

    static {
        subjectTopics.put("Java-Fresher",
                Arrays.asList("What is Programming", "Basic Syntax", "Setting up Environment"));
        subjectTopics.put("Java-Beginner",
                Arrays.asList("Variables", "Data Types", "Operators", "Loops", "If-Else Statements"));
        subjectTopics.put("Java-Intermediate",
                Arrays.asList("Arrays", "Strings", "OOPS Concepts", "Recursion", "Methods"));
        subjectTopics.put("Java-Advanced",
                Arrays.asList("Collections Framework", "Multithreading", "File Handling", "JDBC", "Streams"));

        subjectTopics.put("C-Fresher", Arrays.asList("Introduction to C", "Structure of C Program", "Basic IO"));
        subjectTopics.put("C-Beginner", Arrays.asList("Control Flow", "Functions", "Basic Pointers"));
        subjectTopics.put("C-Intermediate",
                Arrays.asList("Advanced Pointers", "Structures", "Unions", "File Operations"));
        subjectTopics.put("C-Advanced", Arrays.asList("Memory Management", "Data Structures in C", "Standard Library"));

        subjectTopics.put("DSA-Fresher",
                Arrays.asList("What is Algorithms", "Time Complexity", "Space Complexity", "Basic Math for DSA"));
        subjectTopics.put("DSA-Beginner", Arrays.asList("Arrays", "Linked Lists", "Stacks", "Queues"));
        subjectTopics.put("DSA-Intermediate",
                Arrays.asList("Searching Algorithms", "Sorting Algorithms", "Hashing", "Trees"));
        subjectTopics.put("DSA-Advanced",
                Arrays.asList("Graphs", "Dynamic Programming", "Backtracking", "Divide and Conquer"));
    }

    public static List<String> recommend(String subject, String level, List<String> completed) {
        String key = subject + "-" + level;
        List<String> allTopics = subjectTopics.getOrDefault(key, new ArrayList<>());
        List<String> result = new ArrayList<>();

        for (String topic : allTopics) {
            if (!completed.contains(topic.trim())) {
                result.add(topic);
            }
        }
        return result;
    }

    // Simple HTTP Server to communicate with FWD
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new java.net.InetSocketAddress(8080), 0);

        server.createContext("/recommend", (exchange -> {
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = queryToMap(query);

            String subject = params.getOrDefault("subject", "Java");
            String level = params.getOrDefault("level", "Beginner");
            List<String> completed = Arrays.asList(params.getOrDefault("completed", "").split(","));

            List<String> rec = recommend(subject, level, completed);

            String jsonResponse = new com.google.gson.Gson().toJson(rec);

            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jsonResponse.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(jsonResponse.getBytes());
            os.close();
        }));

        server.setExecutor(null);
        server.start();
        System.out.println("Server started at http://localhost:8080");
    }

    // Helper to parse URL query
    public static Map<String, String> queryToMap(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null)
            return map;

        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length > 1)
                map.put(pair[0], pair[1]);
        }
        return map;
    }
}