import io.camunda.zeebe.el.ExpressionLanguageFactory;
import io.camunda.zeebe.engine.processing.common.ExpressionProcessor;
import io.camunda.zeebe.engine.processing.deployment.transform.BpmnValidator;
import io.camunda.zeebe.engine.processing.deployment.transform.ValidationConfig;
import io.camunda.zeebe.engine.processing.expression.ScopedEvaluationContext;
import io.camunda.zeebe.model.bpmn.Bpmn;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Runs Zeebe's deploy-time parse + XSD + design-time + runtime validators on each file. Exit 1 if any rejected.
 *
 * <p>Arguments are file paths; {@code @list} reads one path per line from {@code list} (avoids argv
 * limits); {@code --json} prints one {@code {"file","ok","errors"}} object per line instead of text.
 */
public class ZCheck {
  public static void main(String[] args) throws Exception {
    var el = ExpressionLanguageFactory.createExpressionLanguage(ZonedDateTime::now);
    var ep = new ExpressionProcessor(el, ScopedEvaluationContext.NONE_INSTANCE, Duration.ofSeconds(1));
    var v = new BpmnValidator(el, ep, new ValidationConfig(255, 255, 255, 10000));
    boolean json = false;
    var files = new ArrayList<String>();
    for (String a : args) {
      if (a.equals("--json")) json = true;
      else if (a.startsWith("@")) {
        for (String l : Files.readAllLines(Path.of(a.substring(1)))) if (!l.isBlank()) files.add(l);
      } else files.add(a);
    }
    int bad = 0;
    for (String f : files) {
      String r;
      boolean parse = false;
      try (var in = new FileInputStream(f)) {
        r = v.validate(Bpmn.readModelFromStream(in));
      } catch (Exception e) {
        parse = true;
        r = "PARSE: " + e.getMessage() + (e.getCause() != null ? " / " + e.getCause().getMessage() : "");
      }
      boolean ok = r == null || r.isEmpty();
      if (!ok) bad++;
      if (json) System.out.println(jsonLine(f, ok, ok ? List.of() : errors(r, parse)));
      else if (ok) System.out.println("OK   " + f);
      else System.out.println("FAIL " + f + "\n" + r.indent(2));
    }
    System.exit(bad > 0 ? 1 : 0);
  }

  // A parse failure is one error however many lines its message has.
  private static List<String> errors(String r, boolean parse) {
    if (parse) return List.of(r);
    var out = new ArrayList<String>();
    // Zeebe groups messages under "- Element: <id>"; keep the id so an error stays attributable.
    String element = null;
    for (String l : r.split("\\R")) {
      String t = l.strip();
      if (t.startsWith("- Element: ")) element = t.substring("- Element: ".length());
      else if (t.startsWith("- ERROR: ")) out.add((element == null ? "" : element + ": ") + t.substring("- ERROR: ".length()));
      else if (!t.isEmpty()) out.add((element == null ? "" : element + ": ") + t);
    }
    return out;
  }

  private static String jsonLine(String file, boolean ok, List<String> errs) {
    var sb = new StringBuilder("{\"file\":").append(str(file)).append(",\"ok\":").append(ok).append(",\"errors\":[");
    for (int i = 0; i < errs.size(); i++) sb.append(i > 0 ? "," : "").append(str(errs.get(i)));
    return sb.append("]}").toString();
  }

  private static String str(String s) {
    var sb = new StringBuilder("\"");
    for (char c : s.toCharArray()) {
      switch (c) {
        case '"' -> sb.append("\\\"");
        case '\\' -> sb.append("\\\\");
        case '\n' -> sb.append("\\n");
        case '\r' -> sb.append("\\r");
        case '\t' -> sb.append("\\t");
        default -> {
          if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
          else sb.append(c);
        }
      }
    }
    return sb.append('"').toString();
  }
}
