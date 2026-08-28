## ADDED Requirements

### Requirement: Student code bulk selection
The system SHALL let an authenticated administrator select all or clear all loaded student voting codes from the admin code list without changing selections for other categories.

#### Scenario: Administrator selects loaded student codes
- **WHEN** the loaded authorized code list contains one or more student codes and the administrator activates the student bulk-select control
- **THEN** every loaded student code is selected and no non-student code is selected by that control

#### Scenario: Administrator clears loaded student codes
- **WHEN** every loaded student code is selected and the administrator activates the same bulk-select control
- **THEN** every loaded student code is cleared and non-student selections remain unchanged

### Requirement: A4 landscape student code print sheet
The system SHALL let an authenticated administrator print selected student codes in a spreadsheet-style table configured for A4 landscape paper.

#### Scenario: Administrator prints selected student codes
- **WHEN** one or more student codes are selected and the administrator activates the print action
- **THEN** the browser print flow presents only the selected student records in a table containing code, category, status, created time, and used time, with administrative controls excluded

#### Scenario: No student code is selected
- **WHEN** no student code is selected
- **THEN** the student-code print action is unavailable and no print flow is opened
