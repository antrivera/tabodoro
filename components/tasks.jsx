import React from 'react';
import TaskList from './task_list';

class Tasks extends React.Component {
  constructor() {
    super();
  }

  toggleContentDisplay() {
    let taskList = document.getElementById('task-list-container');
    taskList.classList.toggle('hide');
  }

  render() {
    return (
      <div>
        <div className="tasks icon" onClick={ this.toggleContentDisplay }> </div>
        <TaskList />
      </div>
    );
  }
}

export default Tasks;
