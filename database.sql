create table `data` (
  rt int(11),
  rt_firstReact int(11),
  stimulus longtext,
  button_pressed VARCHAR(20),
  trial_type VARCHAR(255),
  trial_index int(11),
  time_elapsed int(11),
  internal_node_id VARCHAR(255),
  correct BIT(1),
  format VARCHAR(255),
  immersion VARCHAR(255),
  scenario VARCHAR(255)
)