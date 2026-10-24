import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * SimpleServer.java
 * Serves the grade-web folder on http://localhost:3000
 *
 * Compile:  javac SimpleServer.java
 * Run:      java  SimpleServer
 */
public class SimpleServer {

    private static final int  PORT = 3000;

    // Absolute path to the folder containing index.html
    private static final Path WEB_ROOT =
        Paths.get("").toAbsolutePath();   // current working directory

    private static final Map<String, String> MIME = Map.of(
        ".html", "text/html; charset=utf-8",
        ".css",  "text/css; charset=utf-8",
        ".js",   "application/javascript; charset=utf-8",
        ".png",  "image/png",
        ".ico",  "image/x-icon"
    );

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        server.createContext("/", exchange -> {
            String uri = exchange.getRequestURI().getPath();
            if (uri.equals("/")) uri = "/index.html";

            // Resolve against absolute web root and normalize to collapse ../ etc.
            Path filePath = WEB_ROOT.resolve(uri.substring(1)).normalize();

            // Security: reject paths that escape the web root
            if (!filePath.startsWith(WEB_ROOT)) {
                send(exchange, 403, "text/plain", "Forbidden".getBytes());
                return;
            }

            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                send(exchange, 404, "text/plain", "404 Not Found".getBytes());
                return;
            }

            String name = filePath.getFileName().toString();
            int dot = name.lastIndexOf('.');
            String ext  = dot >= 0 ? name.substring(dot) : "";
            String mime = MIME.getOrDefault(ext, "application/octet-stream");
            byte[] body = Files.readAllBytes(filePath);

            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            send(exchange, 200, mime, body);
        });

        server.start();
        System.out.println("================================================");
        System.out.println("  GradeSystem server started!");
        System.out.println("  Serving: " + WEB_ROOT);
        System.out.println();
        System.out.println("  Open your browser and go to:");
        System.out.println("  http://localhost:" + PORT);
        System.out.println("================================================");
        System.out.println("  Press Ctrl+C to stop the server.");
    }

    private static void send(HttpExchange ex, int code, String mime, byte[] body)
            throws IOException {
        ex.getResponseHeaders().set("Content-Type", mime);
        ex.sendResponseHeaders(code, body.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(body); }
    }
}
