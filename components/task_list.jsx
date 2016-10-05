/* global chrome */

import React from 'react';

class TaskList extends React.Component {
  constructor() {
    super();

    this.state = {
      newTaskName: "",
      tasks: ["Focus"]
    }

    this.saveNewTask = this.saveNewTask.bind(this);
    this.updateActiveTask = this.updateActiveTask.bind(this);
    this._hideTasks = this._hideTasks.bind(this);
  }

  componentDidMount() {
    this.fetchStoredTasks();
    document.addEventListener('click', this._hideTasks(), false);
  }

  _hideTasks() {
    return e => {
      let tasks = document.getElementById('task-list-container');
      let taskIcon = document.getElementsByClassName('tasks')[0];

      if (e.target !== taskIcon && !tasks.contains(e.target)) {
        tasks.classList.add('hide');
      }
    }
  }

  fetchStoredTasks() {
    chrome.storage.sync.get('tasks', ({tasks}) => {
      if (tasks) {
        this.setState({tasks, newTaskName: ""});
      }
    });
  }

  saveNewTask() {
    if (this.state.newTaskName.length > 0) {
      chrome.storage.sync.set({tasks: [...this.state.tasks, this.state.newTaskName]}, () =>
      this.fetchStoredTasks()
    );
    }
  }

  updateActiveTask(task) {
    return () => {
      chrome.storage.sync.set({activeTask: task});
    }
  }

  update(name) {
    return e => {this.setState({newTaskName: e.currentTarget.value})};
  }

  render() {
    return (
      <div id="task-list-container" className="hide">
        <div className="new-task-input">
          <input className={"new-task"}
            type="text"
            placeholder="Enter a new task..."
            value={this.state.newTaskName}
            ref="new-task-name"
            onChange={this.update("newTaskName")} />
          <button className={"save-new-task"} onClick={this.saveNewTask}>Add</button>
        </div>
        <ul id="task-items">
          { this.state.tasks.map((task, idx) => (
            <li key={idx}>
              <div className={"task-item"} onClick={this.updateActiveTask(task)}>{task}</div>
            </li>
          )) }
        </ul>
      </div>
    );
  }
}

export default TaskList;
