import { useState, type FC } from "react";

type Tech = "Node.js" | "Angular" | "React";

interface Project {
  id: string;
  title: string;
  tech: Tech;
  description: string;
  highlights: string[];
  github?: string;
  demo?: string;
}

const PROJECTS: Project[] = [
  {
    id: "api-rest-node",
    tech: "Node.js",
    title: "API REST escalable con Node.js",
    description:
      "Servicio backend con Express, autenticación JWT y arquitectura en capas.",
    highlights: [
      "Diseño de endpoints RESTful y versionado de API",
      "Autenticación y autorización basada en roles",
      "Uso de middlewares reutilizables y pruebas básicas"
    ]
  },
  {
    id: "dashboard-angular",
    tech: "Angular",
    title: "Dashboard administrativo en Angular",
    description:
      "SPA modular con routing avanzado, guards y componentes reutilizables.",
    highlights: [
      "Gestión de estado local y comunicación entre componentes",
      "Consumo de APIs y manejo de observables",
      "Uso de material design y lazy loading de módulos"
    ]
  },
  {
    id: "portfolio-react",
    tech: "React",
    title: "Portafolio interactivo en React",
    description:
      "Sitio moderno con diseño responsive y componentes desacoplados.",
    highlights: [
      "Custom hooks para separar lógica de presentación",
      "React Router para navegación entre secciones",
      "Buenas prácticas con TypeScript y tipado estricto"
    ]
  }
];

const App: FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@")) {
      setEmailError("Se necesita la @ en el correo.");
      return;
    }

    setEmailError("");
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-left">
          <span className="logo">PS</span>
          <nav className="nav">
            <a href="#sobre-mi">Sobre mí</a>
            <a href="#proyectos">Proyectos</a>
            <a href="#skills">Skills</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
        <a
          href="#contacto"
          className="btn btn-primary btn-small"
        >
          Hablemos
        </a>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="hero-kicker">Ingeniero de Sistemas</p>
            <h1>
              Desarrollo soluciones con{" "}
              <span className="gradient-text">Node.js, Angular y React</span>
            </h1>
            <p className="hero-subtitle">
              Diseño y construyo aplicaciones web modernas, escalables y
              mantenibles, cuidando la arquitectura, la calidad del código y la
              experiencia de usuario.
            </p>
            <div className="hero-actions">
              <a href="#proyectos" className="btn btn-primary">
                Ver proyectos
              </a>
              <a href="#skills" className="btn btn-ghost">
                Ver stack tecnológico
              </a>
            </div>
          </div>
          <div className="hero-card">
            <p className="hero-card-title">Áreas de enfoque</p>
            <ul className="pill-list">
              <li>APIs REST con Node.js</li>
              <li>SPAs empresariales con Angular</li>
              <li>Interfaces dinámicas con React</li>
              <li>Buenas prácticas y patrones</li>
            </ul>
          </div>
        </section>

        <section id="proyectos" className="section">
          <div className="section-header">
            <h2>Proyectos destacados</h2>
            <p>
              Algunos ejemplos que muestran mi forma de trabajar en{" "}
              <strong>Node.js</strong>, <strong>Angular</strong> y{" "}
              <strong>React</strong>. Puedes adaptar los textos a tus propios
              proyectos reales.
            </p>
          </div>

          <div className="tabs">
            <span className="tab active">Todos</span>
            <span className="tab">Node.js</span>
            <span className="tab">Angular</span>
            <span className="tab">React</span>
          </div>

          <div className="grid">
            {PROJECTS.map((project) => (
              <article key={project.id} className="card">
                <div className="card-badge">{project.tech}</div>
                <h3>{project.title}</h3>
                <p className="card-description">{project.description}</p>
                <ul className="card-list">
                  {project.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="card-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noreferrer">
                      Código
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noreferrer">
                      Demo
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section">
          <div className="section-header">
            <h2>Stack técnico</h2>
            <p>
              Tecnologías y buenas prácticas que utilizo con más frecuencia en
              mis proyectos.
            </p>
          </div>
          <div className="grid grid-3">
            <article className="card compact">
              <h3>Node.js</h3>
              <ul className="card-list compact">
                <li>APIs REST con Express o Fastify</li>
                <li>Autenticación JWT y manejo de sesiones</li>
                <li>Integración con bases de datos SQL/NoSQL</li>
                <li>Mejores prácticas de arquitectura backend</li>
              </ul>
            </article>
            <article className="card compact">
              <h3>Angular</h3>
              <ul className="card-list compact">
                <li>Módulos, componentes y servicios reutilizables</li>
                <li>RxJS, Observables y manejo de estados</li>
                <li>Routing, guards y lazy loading</li>
                <li>Formularios reactivos y validaciones</li>
              </ul>
            </article>
            <article className="card compact">
              <h3>React</h3>
              <ul className="card-list compact">
                <li>Componentes funcionales con hooks</li>
                <li>Gestión de estado local y global</li>
                <li>React Router y arquitectura de vistas</li>
                <li>TypeScript y composición de componentes</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="sobre-mi" className="section">
          <div className="section-header">
            <h2>Sobre mí</h2>
          </div>
          <div className="about">
            <p>
              Ingeniero de Sistemas de la Universidad de Nariño, con experiencia
              en desarrollo de software, migración de datos y despliegue de
              aplicaciones en entornos empresariales críticos.
            </p>
            <p>
              He participado en proyectos de alto impacto en Heinsohn Business
              Technology, incluyendo la migración del Sistema Integral de
              Pensiones de Bolivia y el proyecto Futura para Protección, donde
              he fortalecido mis habilidades técnicas en arquitecturas backend,
              procesamiento masivo de datos y entornos AS/400 (IBM i).
            </p>
            <p>Cuento con experiencia en:</p>
            <ul className="card-list compact">
              <li>
                Desarrollo Full-Stack con React (Hooks, Redux) y diseño de
                aplicaciones de escritorio.
              </li>
              <li>
                Construcción de servicios web en NodeJS y C# con ASP.NET (MVC),
                documentados con Swagger.
              </li>
              <li>
                Desarrollo y optimización de funciones complejas en PL/pgSQL
                para procesamiento de altos volúmenes de datos (ETL).
              </li>
              <li>
                Trabajo en entornos AS/400 (IBM i): compilación, mantenimiento y
                despliegue de programas, gestión de bibliotecas, análisis de
                dependencias, control de procesos batch y promoción entre
                ambientes (DEV, QA, PROD).
              </li>
              <li>
                Contenerización y despliegue en Docker en ambientes de pruebas,
                preproducción y producción.
              </li>
              <li>
                Uso de control de versiones con Git y gestión de cambios con
                Liquibase.
              </li>
              <li>
                Formación complementaria en Amazon Web Services (AWS), con
                enfoque en arquitectura cloud, seguridad, escalabilidad y
                optimización de rendimiento.
              </li>
            </ul>
            <p>
              Me caracterizo por ser una persona honesta, responsable y
              orientada a resultados, con alta capacidad de adaptación y
              aprendizaje continuo. Disfruto enfrentar retos técnicos complejos
              y aportar soluciones eficientes que equilibren rendimiento,
              calidad y estabilidad operativa.
            </p>
            <p>
              Comprometido con la mejora constante y con aportar valor
              estratégico a los proyectos en los que participo.
            </p>
          </div>
        </section>

        <section id="contacto" className="section section-contact">
          <div className="section-header">
            <h2>Contacto</h2>
            <p>
              ¿Te interesa colaborar o quieres ver más código? Escríbeme y
              estaré encantado de responder.
            </p>
          </div>
          <div className="contact-card">
            <form
              className="form"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="form-field">
                  <label>Nombre</label>
                  <input placeholder="Tu nombre" />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={emailError ? "true" : "false"}
                  />
                  {emailError && (
                    <span className="form-error">{emailError}</span>
                  )}
                </div>
              </div>
              <div className="form-field">
                <label>Mensaje</label>
                <textarea rows={4} placeholder="Cuéntame qué necesitas..." />
              </div>
              <button className="btn btn-primary" type="submit">
                Enviar (maquetado)
              </button>
              <p className="form-hint">
                Este formulario es solo de demostración. Puedes sustituirlo por
                un backend en Node.js o un servicio de email real.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Pablo Narvaez</span>
        <span>Node.js · Angular · React</span>
      </footer>
    </div>
  );
};

export { App };
