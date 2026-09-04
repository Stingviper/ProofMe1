import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Database, Layers3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SkillSelection.css";

const skills = [
  { id: "java", name: "Java", description: "Core Java, OOP and programming fundamentals", icon: Code2, type: "assessment" },
  { id: "javascript", name: "JavaScript", description: "Modern JavaScript and programming concepts", icon: Code2, type: "assessment" },
  { id: "dsa", name: "Data Structures", description: "Algorithms, problem solving and coding", icon: Layers3, type: "coding" },
  { id: "sql", name: "SQL", description: "Queries, databases and data management", icon: Database, type: "assessment" },
];

export default function SkillSelection() {
  const navigate = useNavigate();

  return (
    <div className="skill-page">
      <nav className="skill-nav">
        <button className="skill-back" onClick={() => navigate("/")}>
          <ArrowLeft size={18} /> Home
        </button>
        <div className="skill-logo"><div className="skill-logo-icon">✓</div>ProofMe</div>
        <div className="skill-nav-status"><CheckCircle2 size={16} /> Skill Verification</div>
      </nav>

      <main className="skill-main">
        <div className="skill-heading">
          <div className="skill-label">CHOOSE YOUR CHALLENGE</div>
          <h1>What skill do you want to prove?</h1>
          <p>Select a technical skill and demonstrate what you know through a ProofMe assessment.</p>
        </div>

        <section className="skill-grid">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <button
                className="skill-card"
                key={skill.id}
                onClick={() => navigate(skill.type === "coding" ? "/coding/dsa" : `/assessment/${skill.id}`)}
              >
                <div className="skill-card-top">
                  <div className="skill-icon"><Icon size={25} /></div>
                  {skill.type === "coding" && <span className="coding-badge">CODING</span>}
                </div>
                <div className="skill-card-content">
                  <h2>{skill.name}</h2>
                  <p>{skill.description}</p>
                </div>
                <div className="skill-card-bottom">
                  <span>{skill.type === "coding" ? "Solve Challenge" : "Start Assessment"}</span>
                  <ArrowRight size={17} />
                </div>
              </button>
            );
          })}
        </section>

        <section className="skill-info">
          <div className="skill-info-icon"><CheckCircle2 size={20} /></div>
          <div>
            <strong>Your score is based on demonstrated performance.</strong>
            <p>Complete the assessment or coding challenge to add the skill to your ProofMe profile.</p>
          </div>
        </section>
      </main>
    </div>
  );
}