import io.camunda.zeebe.el.ExpressionLanguageFactory;
import io.camunda.zeebe.engine.processing.common.ExpressionProcessor;
import io.camunda.zeebe.engine.processing.deployment.transform.BpmnValidator;
import io.camunda.zeebe.engine.processing.deployment.transform.ValidationConfig;
import io.camunda.zeebe.engine.processing.expression.ScopedEvaluationContext;
import io.camunda.zeebe.model.bpmn.Bpmn;
import java.io.FileInputStream;
import java.time.Duration;
import java.time.ZonedDateTime;

/** Runs Zeebe's deploy-time parse + XSD + design-time + runtime validators on each file. Exit 1 if any rejected. */
public class ZCheck {
  public static void main(String[] args) throws Exception {
    var el = ExpressionLanguageFactory.createExpressionLanguage(ZonedDateTime::now);
    var ep = new ExpressionProcessor(el, ScopedEvaluationContext.NONE_INSTANCE, Duration.ofSeconds(1));
    var v = new BpmnValidator(el, ep, new ValidationConfig(255, 255, 255, 10000));
    int bad = 0;
    for (String f : args) {
      String r;
      try (var in = new FileInputStream(f)) {
        r = v.validate(Bpmn.readModelFromStream(in));
      } catch (Exception e) {
        r = "PARSE: " + e.getMessage() + (e.getCause() != null ? " / " + e.getCause().getMessage() : "");
      }
      if (r == null || r.isEmpty()) System.out.println("OK   " + f);
      else { bad++; System.out.println("FAIL " + f + "\n" + r.indent(2)); }
    }
    System.exit(bad > 0 ? 1 : 0);
  }
}
