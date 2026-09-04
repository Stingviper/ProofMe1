import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { saveSkillResult } from "./lib/data";
import "./Assessment.css";

// ProofMe uses application-focused questions: debugging, output prediction,
// query writing, API/data handling, performance and practical code reasoning.
const banks = {
  java: [
    ["A payment service throws NullPointerException here. What is the safest fix?\n\nString email = user.getEmail();", ["Wrap the line in a while loop", "Check user for null before calling getEmail()", "Make email static", "Use System.gc()"], 1],
    ["What is printed by this code?\n\nint x = 5;\nSystem.out.println(x++ + ++x);", ["10", "11", "12", "13"], 2],
    ["A Java method is supposed to return the largest value in an array. What bug exists?\n\nint max = 0;\nfor (int n : nums) if (n > max) max = n;\nreturn max;", ["Enhanced for-loop is invalid", "It fails when all numbers are negative", "return cannot be used in a method", "Arrays cannot contain integers"], 1],
    ["An API receives the same customer ID many times. Which collection is most suitable for storing unique IDs with fast lookup?", ["ArrayList", "HashSet", "Stack", "PriorityQueue"], 1],
    ["What is the output?\n\nString a = new String(\"Java\");\nString b = new String(\"Java\");\nSystem.out.println(a == b);", ["true", "false", "Compilation error", "Runtime exception"], 1],
    ["A developer writes this code and gets a compilation error. Why?\n\nList<String> names = new ArrayList<>();\nnames.add(10);", ["ArrayList cannot store strings", "Generics prevent adding an Integer to a List<String>", "List must be static", "add() only accepts objects"], 1],
    ["Which implementation is the best choice for a queue of customer requests where insertion happens at the end and removal at the front?", ["ArrayDeque", "HashMap", "TreeSet", "StringBuilder"], 0],
    ["A service needs key-value lookup by user ID and does not require sorted keys. Which structure is the best fit?", ["HashMap", "TreeMap", "ArrayList", "LinkedList"], 0],
    ["What is printed?\n\ntry {\n    int n = 10 / 0;\n    System.out.print(\"A\");\n} catch (ArithmeticException e) {\n    System.out.print(\"B\");\n}", ["A", "B", "AB", "Compilation error"], 1],
    ["A method accepts a list but should not allow the caller to modify it through the returned reference. Which is the most direct approach?", ["Return the original list", "Return an unmodifiable view/copy", "Convert it to int", "Call System.gc()"], 1],
    ["What is wrong with this code?\n\nclass User {\n    private String name;\n}\nUser u = new User();\nu.name = \"Om\";", ["String cannot be private", "name cannot be accessed directly because it is private", "User objects cannot be created", "private fields must be static"], 1],
    ["A loop searches for a target in an unsorted array. Which change can reduce average work when many searches are performed?", ["Sort once and use binary search", "Use nested loops", "Convert every value to String", "Use recursion only"], 0],
    ["What does this print?\n\nint[] a = {1, 2, 3};\nfor (int i = 0; i < a.length; i++) {\n    a[i] *= 2;\n}\nSystem.out.println(Arrays.toString(a));", ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "Compilation error"], 1],
    ["A developer catches Exception everywhere and ignores it. What is the main practical problem?", ["It improves debugging", "It can hide real failures and make diagnosis difficult", "It makes code thread-safe", "It prevents all runtime errors"], 1],
    ["What is the output?\n\nString s = \"hello\";\ns = s.toUpperCase();\nSystem.out.println(s);", ["hello", "HELLO", "Hello", "Compilation error"], 1],
    ["A Java application creates thousands of temporary String objects in a loop. Which class is better for repeated string modifications in one thread?", ["StringBuilder", "String", "Integer", "Character"], 0],
    ["A method needs to sort employees by salary using the natural ordering supplied by the Employee class. Which interface is relevant?", ["Runnable", "Comparable", "Serializable", "Cloneable"], 1],
    ["What is the bug?\n\nfor (int i = 0; i <= arr.length; i++) {\n    System.out.println(arr[i]);\n}", ["Loop never executes", "The final iteration accesses arr[arr.length] and causes an exception", "Arrays start at 1", "<= is required for arrays"], 1],
    ["A web application has multiple threads updating the same counter. Which issue can occur with `count++`?", ["Syntax error", "Race condition because the increment is not atomic", "Automatic deadlock", "Garbage collection"], 1],
    ["Which keyword should be used when a shared variable must have reads/writes visible across threads, but the operation itself does not need to be atomic?", ["volatile", "final", "native", "transient"], 0],
    ["What does this print?\n\nint x = 3;\nif (x > 5) {\n    System.out.print(\"A\");\n} else {\n    System.out.print(\"B\");\n}", ["A", "B", "AB", "Nothing"], 1],
    ["A file-reading operation must always close its resource even when an exception occurs. Which Java feature is designed for this?", ["try-with-resources", "switch", "instanceof", "varargs"], 0],
    ["Which option correctly handles a possible null String before calling length()?", ["s.length()", "if (s != null) s.length();", "String.length(s)", "length(s) == null"], 1],
    ["What is the output?\n\nint a = 10;\nint b = 3;\nSystem.out.println(a / b);", ["3", "3.33", "4", "10/3"], 0],
    ["A developer needs sorted unique product IDs. Which collection is the most direct choice?", ["HashSet", "TreeSet", "ArrayList", "HashMap"], 1],
    ["Which change fixes this common infinite loop?\n\nint i = 0;\nwhile (i < 5) {\n    System.out.println(i);\n}", ["Change while to if", "Increment i inside the loop", "Remove the condition", "Make i final"], 1],
    ["A REST endpoint receives JSON and needs to map it into a Java object. What concept is this commonly called?", ["Deserialization", "Compilation", "Garbage collection", "Overloading"], 0],
    ["A method receives a `List<Integer>` and repeatedly checks whether a value exists. Which approach is usually faster for many membership checks?", ["Convert to HashSet", "Convert to String", "Use recursion", "Reverse the list first"], 0],
    ["What is the output?\n\nint sum = 0;\nfor (int i = 1; i <= 3; i++) sum += i;\nSystem.out.println(sum);", ["3", "5", "6", "7"], 2],
    ["A class should prevent direct modification of its balance field and expose controlled updates through methods. Which principle is being applied?", ["Encapsulation", "Inheritance", "Recursion", "Casting"], 0],
  ],
  javascript: [
    ["A button handler needs to read the latest value of an input each time it is clicked. Which is the correct approach?\n\nbutton.addEventListener(\"click\", () => { /* ... */ });", ["Read the input value inside the click handler", "Read it only once when the page loads", "Make the input a const primitive", "Use JSON.parse on the button"], 0],
    ["What is printed?\n\nconsole.log(\"5\" + 2);", ["7", "52", "NaN", "TypeError"], 1],
    ["What is printed?\n\nconsole.log(\"5\" - 2);", ["3", "52", "NaN", "TypeError"], 0],
    ["A fetch request returns JSON. Which sequence is correct?", ["fetch(url).json()", "fetch(url).then(r => r.json())", "JSON.fetch(url)", "await JSON(url)"], 1],
    ["What is the output?\n\nconst nums = [1, 2, 3];\nconst result = nums.map(n => n * 2);\nconsole.log(result);", ["[1,2,3]", "[2,4,6]", "6", "undefined"], 1],
    ["A filter is intended to keep only users older than 18. Which callback is correct?", ["users.filter(u => u.age > 18)", "users.map(u => u.age > 18)", "users.find(u => u.age)", "users.reduce(u => u.age > 18)"], 0],
    ["What is wrong here?\n\nconst user = { name: \"Om\" };\nuser = { name: \"Alex\" };", ["Objects cannot contain strings", "A const variable cannot be reassigned", "Object literals are invalid", "name must be static"], 1],
    ["What does `===` help prevent in practical application code?", ["Unexpected type coercion during equality checks", "All runtime exceptions", "Network failures", "Memory leaks"], 0],
    ["What is printed?\n\nlet count = 0;\nfunction test() {\n  count++;\n}\ntest();\ntest();\nconsole.log(count);", ["0", "1", "2", "undefined"], 2],
    ["A page becomes slow because a function runs on every keystroke. Which technique is commonly used to delay execution until the user pauses typing?", ["Debouncing", "Inheritance", "Memoization only", "Deserialization"], 0],
    ["What is the output?\n\nconsole.log(typeof null);", ["null", "object", "undefined", "boolean"], 1],
    ["A developer wants to create a new array without mutating the original. Which is a correct option?", ["const copy = [...items]", "const copy = items", "items = null", "Object.freeze(items) then push"], 0],
    ["What is printed?\n\nconst a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(a);", ["[1,2]", "[1,2,3]", "[3]", "Error"], 1],
    ["A Promise is rejected. Which handler is intended for handling that failure in a `.then()` chain?", [".catch()", ".map()", ".filter()", ".finallyOnly()"], 0],
    ["What is printed?\n\nasync function getValue() { return 10; }\nconsole.log(getValue() instanceof Promise);", ["true", "false", "10", "undefined"], 0],
    ["A frontend receives user-entered text and inserts it with `innerHTML`. What is the main security concern?", ["SQL indexing", "Cross-site scripting (XSS)", "Stack overflow from arrays", "Java compilation"], 1],
    ["Which statement correctly parses a JSON string into a JavaScript object?", ["JSON.parse(text)", "JSON.stringify(text)", "JSON.object(text)", "parse.JSON(text)"], 0],
    ["What does `JSON.stringify({a: 1})` produce?", ["A JSON string", "A Promise", "An array", "A DOM node"], 0],
    ["What is the output?\n\nconsole.log([1, 2, 3].find(n => n > 1));", ["1", "2", "[2,3]", "true"], 1],
    ["A function uses a variable from its outer scope even after the outer function has returned. This behavior is called:", ["Closure", "Hoisting only", "Casting", "Destructuring"], 0],
    ["What is the output?\n\nfor (var i = 0; i < 3; i++) {}\nconsole.log(i);", ["0", "2", "3", "undefined"], 2],
    ["Which declaration prevents reassignment of the variable binding?", ["let", "var", "const", "function"], 2],
    ["A React-style state update depends on the previous value. Which pattern is safer?", ["setCount(count + 1)", "setCount(prev => prev + 1)", "count = count + 1", "const count = count + 1"], 1],
    ["What is printed?\n\nconsole.log(Boolean(\"\"));", ["true", "false", "\"\"", "undefined"], 1],
    ["A network request should not block the UI while waiting. Which JavaScript feature is commonly used with fetch for readable asynchronous code?", ["async/await", "switch/case", "prototype only", "for...in only"], 0],
    ["What is wrong with this code?\n\nconst numbers = [1, 2, 3];\nnumbers.forEach(n => { return n * 2; });\nconsole.log(numbers);", ["forEach automatically replaces elements", "forEach does not create a transformed array; use map for that", "return is illegal", "numbers cannot contain integers"], 1],
    ["A search box should ignore letter case. Which is a simple approach for comparing two user-entered strings?", ["Convert both to lower case before comparing", "Use === without normalization", "Use JSON.stringify only", "Use parseInt"], 0],
    ["What is the output?\n\nconst x = null;\nconsole.log(x ?? \"Guest\");", ["null", "Guest", "undefined", "Error"], 1],
    ["A timer created with `setInterval` should stop when a component/page is removed. What should the code do?", ["Call clearInterval with the interval ID", "Call JSON.parse", "Use Array.sort", "Call Math.floor"], 0],
    ["Which approach is best when rendering a list in a UI and each item needs a stable identity?", ["Use a stable unique key such as an item ID", "Use Math.random() on every render", "Use the array index in every case", "Do not identify items"], 0],
  ],
  sql: [
    ["A shop wants all orders placed after 2026-01-01. Which query is correct?", ["SELECT * FROM orders WHERE order_date > '2026-01-01';", "SELECT * FROM orders AFTER '2026-01-01';", "GET orders WHERE date > 2026;", "SELECT orders FILTER order_date;"], 0],
    ["A report must show customers even if they have no orders. Which join should normally start from customers?", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN only"], 1],
    ["Which query returns only unique cities from a customers table?", ["SELECT UNIQUE city FROM customers;", "SELECT DISTINCT city FROM customers;", "SELECT ONLY city FROM customers;", "SELECT city UNIQUE FROM customers;"], 1],
    ["A developer writes `SELECT * FROM users WHERE name = NULL;` and gets no expected matches. What is the correct condition?", ["name = NULL", "name IS NULL", "name == NULL", "name EQUALS NULL"], 1],
    ["Which query counts the number of orders per customer?", ["SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id;", "SELECT COUNT(customer_id) FROM orders;", "GROUP orders BY customer_id COUNT;", "SELECT customer_id FROM orders COUNT;"], 0],
    ["You need customers with more than 5 orders. Where should the aggregate condition go?", ["WHERE COUNT(*) > 5", "HAVING COUNT(*) > 5", "ORDER BY COUNT(*) > 5", "ON COUNT(*) > 5"], 1],
    ["Which query returns the top 5 highest salaries?", ["SELECT * FROM employees ORDER BY salary DESC LIMIT 5;", "SELECT TOP salary DESC 5 FROM employees;", "SELECT * FROM employees LIMIT salary 5;", "ORDER employees BY salary HIGH 5;"], 0],
    ["A query joins orders to customers using customer_id. What is the main reason for the JOIN?", ["Combine related rows from different tables", "Encrypt the database", "Create a backup", "Delete duplicate databases"], 0],
    ["Which query finds products whose name contains 'phone'?", ["SELECT * FROM products WHERE name LIKE '%phone%';", "SELECT * FROM products WHERE name = '%phone%';", "SELECT * FROM products CONTAINS phone;", "SELECT * FROM products MATCH phone ONLY;"], 0],
    ["A query uses `WHERE department = 'IT' AND salary > 50000`. What does it return?", ["IT employees with salary above 50000", "All IT employees or all high earners", "Only employees below 50000", "Only departments with no employees"], 0],
    ["Which query safely updates one employee when employee_id is unique?", ["UPDATE employees SET salary = 60000 WHERE employee_id = 10;", "UPDATE employees salary = 60000;", "CHANGE employees salary WHERE id 10;", "SET employees salary 60000;"], 0],
    ["What is the practical danger of running `DELETE FROM users;` without a WHERE clause?", ["It deletes all rows in the table", "It deletes the table structure only", "It only deletes one row", "It creates an index"], 0],
    ["A report needs departments with an average salary above 70000. Which pattern is correct?", ["GROUP BY department HAVING AVG(salary) > 70000", "WHERE AVG(salary) > 70000", "ORDER BY AVG(salary) > 70000", "GROUP BY salary WHERE department"], 0],
    ["Which query returns employees whose salary is between 40000 and 60000, inclusive?", ["WHERE salary BETWEEN 40000 AND 60000", "WHERE salary IN 40000 TO 60000", "WHERE salary RANGE 40000,60000", "WHERE salary > 40000 OR < 60000"], 0],
    ["A login query should find a user by email. Which condition is usually appropriate when email is unique?", ["WHERE email = 'user@example.com'", "GROUP BY email", "ORDER BY email", "HAVING email"], 0],
    ["What does an INNER JOIN return?", ["Rows with matching join conditions in both tables", "All rows from the left table", "All rows from the right table", "Every possible row combination"], 0],
    ["Which query gets the second-highest distinct salary in a simple SQL dialect supporting OFFSET?", ["SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;", "SELECT salary SECOND FROM employees;", "SELECT salary FROM employees WHERE rank = 2;", "SELECT SECOND(salary) FROM employees;"], 0],
    ["A product table has `price = 100` and a query uses `WHERE price > 100`. Is the product included?", ["Yes", "No", "Only with GROUP BY", "Only with JOIN"], 1],
    ["Which command adds a new column to an existing table?", ["ALTER TABLE", "UPDATE TABLE", "MODIFY ROW", "INSERT COLUMN"], 0],
    ["Which query finds duplicate email values?", ["SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;", "SELECT DUPLICATE email FROM users;", "SELECT email FROM users WHERE COUNT(*) > 1;", "GROUP users BY duplicate email;"], 0],
    ["A dashboard repeatedly filters orders by `customer_id`. Which database feature can improve lookup performance?", ["Index on customer_id", "Trigger on every SELECT", "Dropping the primary key", "Converting rows to JSON"], 0],
    ["Which statement about WHERE and HAVING is correct?", ["WHERE filters rows before grouping; HAVING filters groups after aggregation", "HAVING always runs before WHERE", "WHERE can only filter strings", "They are exactly the same"], 0],
    ["What does `COALESCE(phone, 'Not provided')` do?", ["Uses 'Not provided' when phone is NULL", "Deletes phone values", "Converts phone to an integer", "Sorts phone numbers"], 0],
    ["A query needs names from customers and total order amount from orders. Which aggregate is commonly used?", ["SUM(orders.amount)", "TOTALROW(orders.amount)", "ADDALL(orders.amount)", "COUNTALL(orders.amount)"], 0],
    ["Which query sorts the newest orders first?", ["ORDER BY order_date DESC", "ORDER BY order_date ASC", "SORT order_date NEW", "GROUP BY order_date DESC"], 0],
    ["What is the main purpose of a primary key?", ["Uniquely identify each row", "Allow duplicate IDs", "Store only encrypted values", "Automatically sort every query"], 0],
    ["A foreign key usually represents what relationship?", ["A reference from one table to a key in another table", "A password", "A backup copy", "A database user"], 0],
    ["Which query returns employees who are not in the HR department?", ["SELECT * FROM employees WHERE department <> 'HR';", "SELECT * FROM employees NOT department 'HR';", "SELECT * FROM employees WHERE department != NULL;", "SELECT * FROM employees EXCEPT HR;"], 0],
    ["A query should return each customer's name and the number of orders, including customers with zero orders. Which approach is best?", ["LEFT JOIN orders, then GROUP BY customer", "INNER JOIN only", "DELETE customers with zero orders", "CROSS JOIN all rows"], 0],
    ["What does `COUNT(column_name)` generally do with NULL values in that column?", ["It does not count NULL values", "It always counts NULL twice", "It converts NULL to 0 automatically", "It deletes NULL rows"], 0],
    ["A SQL injection risk exists when user input is concatenated directly into SQL strings. What is the common safer approach in application code?", ["Parameterized/prepared statements", "String concatenation with more spaces", "ORDER BY user input", "Disabling indexes"], 0],
  ],
};

const labels = { java: "Java", javascript: "JavaScript", sql: "SQL" };

export default function Assessment() {
  const { skill = "java" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const questions = banks[skill] || banks.java;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  const progress = useMemo(() => Math.round(((current + 1) / questions.length) * 100), [current, questions.length]);
  const q = questions[current];

  const choose = (index) => {
    setAnswers((prev) => ({ ...prev, [current]: index }));
    setError("");
  };

  const next = () => {
    if (answers[current] === undefined) {
      setError("Select an answer before continuing.");
      return;
    }
    if (current < questions.length - 1) setCurrent((v) => v + 1);
  };

  const previous = () => {
    setError("");
    if (current > 0) setCurrent((v) => v - 1);
  };

  const submit = async () => {
    if (answers[current] === undefined) {
      setError("Select an answer before submitting.");
      return;
    }

    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question[2]) correct++;
    });

    const score = Math.round((correct / questions.length) * 100);
    try {
      await saveSkillResult({ userId: user.id, skillId: skill, score, correct, total: questions.length });
      navigate(`/result/${skill}?score=${score}&correct=${correct}`);
    } catch (saveError) {
      setError(saveError.message || "Unable to save your result. Please try again.");
    }
  };

  return (
    <div className="assessment-page">
      <nav className="assessment-nav">
        <button onClick={() => navigate("/skills")}><ArrowLeft size={18}/> Skills</button>
        <div className="assessment-logo"><span>✓</span> ProofMe</div>
        <div className="assessment-nav-label"><Clock3 size={16}/> Practical Technical Assessment</div>
      </nav>

      <main className="assessment-main">
        <div className="assessment-top">
          <div>
            <span className="assessment-label">PRACTICAL SKILL ASSESSMENT</span>
            <h1>{labels[skill] || "Java"}</h1>
          </div>
          <div className="assessment-count">Question {current + 1} / {questions.length}</div>
        </div>

        <p className="assessment-subtitle">Debug code, predict output, choose the right implementation, and solve real development scenarios.</p>
        <div className="assessment-progress"><span style={{ width: `${progress}%` }}/></div>

        <section className="question-card">
          <div className="question-number">QUESTION {String(current + 1).padStart(2, "0")}</div>
          <h2>{q[0]}</h2>

          <div className="options">
            {q[1].map((option, index) => (
              <button
                className={`option ${answers[current] === index ? "selected" : ""}`}
                key={`${current}-${index}`}
                onClick={() => choose(index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className={option.includes("\n") || option.includes("SELECT ") || option.includes("const ") || option.includes("int ") || option.includes("console.") ? "option-text code-option" : "option-text"}>{option}</span>
                {answers[current] === index && <CheckCircle2 size={18}/>} 
              </button>
            ))}
          </div>

          {error && <div className="assessment-error">{error}</div>}
        </section>

        <div className="assessment-actions">
          <button className="assessment-secondary" onClick={previous} disabled={current === 0}>Previous</button>
          {current < questions.length - 1 ? (
            <button className="assessment-primary" onClick={next}>Next <ArrowRight size={17}/></button>
          ) : (
            <button className="assessment-primary" onClick={submit}>Submit Assessment <CheckCircle2 size={17}/></button>
          )}
        </div>
      </main>
    </div>
  );
}
