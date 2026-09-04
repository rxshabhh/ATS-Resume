"""
Resume / job-description pairs used by the benchmarks.

These are SYNTHETIC. They were written by hand to exercise the scoring
vocabulary across a range of overlap — some pairs match almost fully, some
barely at all — not sampled from real applications. Any figure derived from
this corpus must be reported as measured on synthetic data; saying otherwise
would be claiming an external validity these pairs do not have.

Real resumes would be better. They are also personal data belonging to other
people, which is why this file exists instead.
"""

# Each entry: (identifier, resume text, job description text)
PAIRS: list[tuple[str, str, str]] = [
    (
        "backend-strong",
        """Rishabh Sinha - Backend Engineer
        Built and shipped REST APIs in Python using FastAPI, backed by PostgreSQL
        with SQLAlchemy. Containerised the stack with Docker and deployed to AWS.
        Set up CI/CD pipelines with GitHub Actions. Comfortable on Linux, daily Git.""",
        """Backend Engineer. Required: Python, FastAPI, REST APIs, PostgreSQL,
        Docker, AWS, CI/CD, Linux, Git.""",
    ),
    (
        "backend-partial",
        """Software developer with two years building web services in Python.
        Experience with Django, MySQL and REST APIs. Deployed on Linux servers.""",
        """Backend Engineer. Required: Python, FastAPI, Docker, Kubernetes,
        PostgreSQL, REST APIs, CI/CD and system design.""",
    ),
    (
        "backend-weak",
        """Recent graduate. Coursework in data structures and algorithms.
        Competitive programming in C++. Built a small Java desktop application.""",
        """Senior Backend Engineer. Required: Python, Django, PostgreSQL,
        Docker, Kubernetes, AWS, microservices and CI/CD.""",
    ),
    (
        "ml-strong",
        """Machine learning engineer. Built deep learning models in Python.
        Deployed inference services with Docker on AWS. Data science pipelines
        over PostgreSQL. Familiar with REST APIs and CI/CD.""",
        """Machine Learning Engineer. Required: Python, machine learning,
        deep learning, Docker, AWS, data science, REST APIs.""",
    ),
    (
        "ml-mismatch",
        """Frontend developer. React, TypeScript, CSS. Built dashboards and
        design systems. Some Git and Linux familiarity.""",
        """Machine Learning Engineer. Required: Python, machine learning,
        deep learning, data science, AWS.""",
    ),
    (
        "devops-strong",
        """Platform engineer. Kubernetes and Docker in production. Terraform on
        AWS. Built CI/CD pipelines. Linux administration, Git, Redis and
        PostgreSQL. Designed microservices boundaries.""",
        """DevOps Engineer. Required: Kubernetes, Docker, AWS, CI/CD, Linux,
        Git, microservices, Redis.""",
    ),
    (
        "devops-partial",
        """Backend developer. Python and FastAPI services. Used Docker for local
        development. PostgreSQL for storage.""",
        """DevOps Engineer. Required: Kubernetes, Docker, AWS, CI/CD, Linux,
        microservices, system design.""",
    ),
    (
        "fullstack-mixed",
        """Full-stack engineer. React on the frontend, Django and Python on the
        backend. MySQL and Redis. Deployed with Docker. Git and Linux daily.""",
        """Full-stack Engineer. Required: Python, Django, REST APIs, MySQL,
        Docker, Git, cloud computing.""",
    ),
    (
        "data-strong",
        """Data engineer. Python pipelines over PostgreSQL and MySQL. SQL for
        analysis. Data science workflows. Orchestrated with Docker on AWS.""",
        """Data Engineer. Required: Python, SQL, PostgreSQL, data science,
        Docker, AWS, data.""",
    ),
    (
        "junior-generic",
        """Computer science student. Projects in Python and Java. Used Git for
        version control. Learning about databases and APIs.""",
        """Software Engineer Intern. Required: Python, Git, SQL, REST APIs,
        backend, Linux.""",
    ),
    (
        "cpp-systems",
        """Systems programmer. C++ for low-latency services on Linux. Some Python
        tooling. Git, Docker for build reproducibility. System design experience.""",
        """Systems Engineer. Required: C++, Linux, system design, Docker, Git.""",
    ),
    (
        "no-overlap",
        """Graphic designer. Adobe Illustrator, Photoshop, brand identity work,
        print production and typography.""",
        """Backend Engineer. Required: Python, FastAPI, PostgreSQL, Docker,
        Kubernetes, AWS.""",
    ),
]


def as_text(entry: tuple[str, str, str]) -> tuple[str, str, str]:
    """Collapse the indentation the triple-quoted literals carry."""
    name, resume, jd = entry
    squash = lambda s: " ".join(s.split())
    return name, squash(resume), squash(jd)


def pairs() -> list[tuple[str, str, str]]:
    return [as_text(e) for e in PAIRS]
