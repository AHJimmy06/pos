# Skill Registry - pos

## User Skills
| Skill | Trigger | Description |
|-------|---------|-------------|
| solid-srp | Defining class responsibilities | Apply the Single Responsibility Principle |
| solid-ocp | Adding new features | Apply the Open/Closed Principle |
| solid-lsp | Inheritance, overriding methods | Apply the Liskov Substitution Principle |
| solid-isp | Defining interfaces | Apply the Interface Segregation Principle |
| solid-dip | Defining module dependencies | Apply the Dependency Inversion Principle |
| pattern-repository | Data access abstraction | Apply the Repository pattern for data persistence |
| pattern-factory-method | Creating objects | Apply the Factory Method pattern |
| pattern-strategy | Runtime algorithms | Apply the Strategy pattern |
| pattern-observer | Event notification | Apply the Observer pattern |
| pattern-facade | Complex subsystems | Apply the Facade pattern |
| pattern-adapter | Incompatible interfaces | Apply the Adapter pattern |
| pattern-decorator | Dynamic responsibilities | Apply the Decorator pattern |
| pattern-composite | Tree structures | Apply the Composite pattern |
| pattern-command | Encapsulate request | Apply the Command pattern |
| pattern-state | Alter behavior on state change | Apply the State pattern |
| pattern-proxy | Control access | Apply the Proxy pattern |
| pattern-memento | Save/restore state | Apply the Memento pattern |
| pattern-mediator | Reduce dependencies | Apply the Mediator pattern |
| pattern-iterator | Traverse collection | Apply the Iterator pattern |
| pattern-flyweight | Optimize memory | Apply the Flyweight pattern |
| pattern-builder | Step-by-step construction | Apply the Builder pattern |
| pattern-bridge | Separate abstraction | Apply the Bridge pattern |
| pattern-template-method | Skeleton of algorithm | Apply the Template Method pattern |
| pattern-visitor | Operations on trees | Apply the Visitor pattern |
| pattern-abstract-factory | Families of objects | Apply the Abstract Factory pattern |
| judgment-day | review adversarial | Parallel adversarial review protocol |
| issue-creation | Creating a GitHub issue | Issue creation workflow |
| branch-pr | Creating a pull request | PR creation workflow |

## Project Standards
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Presentation).
- **Domain**: Entities and Repository Interfaces (abstract classes).
- **Application**: Use Cases for business logic orchestration.
- **Infrastructure**: Implementations of repositories, API clients, and mappers.
- **Presentation**: React components, hooks, and store (Zustand).

## Compact Rules
### SOLID Principles
- **SRP**: One reason to change.
- **OCP**: Open for extension, closed for modification.
- **LSP**: Subtypes must be substitutable for base types.
- **ISP**: Small, client-focused interfaces.
- **DIP**: Depend on abstractions, not concretions.

### Architecture Patterns
- **Repository**: Use abstract classes in `domain/repositories` and implement in `infrastructure/repositories`.
- **Use Cases**: Encapsulate single business operations in `application/use-cases`.
- **Dependency Injection**: Inject repository implementations via React Context (`RepositoryContext`).
- **Mappers**: Transform API DTOs to Domain Entities in `infrastructure/mappers`.
