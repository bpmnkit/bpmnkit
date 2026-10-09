# Migrate to Camunda Process Test — Migrate your process tests — Process instance assertions

ZPT has assertions for a process instance using `BpmnAssert.assertThat()` with the `ProcessInstanceEvent` or the
`ProcessInstanceResult`.

CPT has equivalent assertions using `CamundaAssert.assertThat()`.

```java
// given
ProcessInstanceEvent processInstance = //

// ZPT:
BpmnAssert.assertThat(processInstance).isCompleted();

// CPT:
CamundaAssert.assertThat(processInstance).isCompleted();
```

Some of CPT's assertions have different method names or signatures. Check the following list for the equivalent CPT
assertion:

    
        
            ZPT: BpmnAssert.assertThat(processInstance)
        
        
            CPT: CamundaAssert.assertThat(processInstance)
        
    
    
        isStarted()
        [isCreated()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#iscreated)
    
    
        isActive()
        [isActive()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#isactive)
    
    
        isCompleted()
        [isCompleted()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#iscompleted)
    
    
        isNotCompleted()
        
            Not supported
            
                Instead, use [isActive()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#isactive) or [isTerminated()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#isterminated).
            
        
    
    
        isTerminated()
        [isTerminated()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#isterminated)
    
    
        isNotTerminated()
        
            Not supported
            
                Instead, use [isActive()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#isactive) or [isCompleted()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#iscompleted).
            
        
    
    
        isWaitingAtElements()
        [hasActiveElements()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasactiveelements)
    
    
        isWaitingExactlyAtElements()
        [hasActiveElementsExactly()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasactiveelementsexactly)
    
    
        isNotWaitingAtElements()
        [hasNoActiveElements()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasnoactiveelements)
    
    
        hasPassedElement()
        [hasCompletedElement()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hascompletedelement)
    
    
        hasPassedElementsInOrder()
        [hasCompletedElementsInOrder()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hascompletedelementsinorder)
    
    
        hasNotPassedElement()
        [hasNotActivatedElements()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasnotactivatedelements)
    
    
        hasVariable()
        [hasVariableNames()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariablenames)
    
    
        hasVariableWithValue()
        [hasVariable()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariable)
    
    
        hasAnyIncidents()
        [hasActiveIncidents()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasactiveincidents)
    
    
        hasNoIncidents()
        [hasNoActiveIncidents()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasnoactiveincidents)
    
    
        isWaitingForMessages()
        [isWaitingForMessage()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#iswaitingformessage)
    
    
        isNotWaitingForMessages()
        [isNotWaitingForMessage()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#isnotwaitingformessage)
    
    
        hasCorrelatedMessageByName()
        [hasCorrelatedMessage()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hascorrelatedmessage)
    
    
        hasCorrelatedMessageByCorrelationKey()
        [hasCorrelatedMessage()](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hascorrelatedmessage)
    
    
        hasCalledProcess()
        
            Not supported
            
                Instead, use a [ProcessInstanceSelector](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#with-process-instance-selector) to assert the child process instance.
            
        
    
    
        hasNotCalledProcess()
        
            Not supported
            
                Instead, assert the call activity or the child process instance.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
