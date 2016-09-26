import React from 'react';

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
      <div className="tasks" onClick={ this.toggleContentDisplay }>
        <div id="task-list-container" className="hide">
          <p>Study</p>
          <p>Programming</p>
          <p>Exercise</p>
        </div>
      </div>
    );
  }
}

export default Tasks;
