let idCount = 0
try {
    let saved = localStorage.getItem("id-count")
    idCount = (saved && saved!=="undefined" && saved!=="null") ? JSON.parse(saved) : 0
}
catch(error) {
    idCount = 0
}
class Task {
    constructor(id,title,status="todo",priority="medium",createdAt = new Date()) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.priority = priority;
        this.createdAt = new Date(createdAt)
    }
    updateStatus(newStatus) {
        this.status = newStatus
    }
    updateTitle(newTitle) {
        if(newTitle.trim().length>0) {
            this.title = newTitle.trim()
            return
        }
        throw new Error("Title is empty")
    }
}
class TaskManager{
    constructor() {
        this.tasks = (this.loadFromLocalStorage() || []).map(task => new Task(task.id,task.title,task.status,task.priority,task.createdAt))
        const maxId = this.tasks.reduce((max, task) => {
            return Math.max(max, task.id)
        }, -1)

        if (idCount <= maxId) {
            idCount = maxId + 1
            localStorage.setItem("id-count", JSON.stringify(idCount))
        }
    }
    addTask(title,status="todo",priority="medium") {
        const task = new Task(idCount++,title,status,priority)
        localStorage.setItem("id-count",JSON.stringify(idCount))
        this.tasks.push(task)
        this.saveToLocalStorage()
        return
    }
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id!==id)
        this.saveToLocalStorage()
    }
    getTaskById(id) {
        for(let task of this.tasks) {
            if(task.id===id) {
                return task
            }
        }
        return null
    }
    saveToLocalStorage() {
        try {
            localStorage.setItem("tasks",JSON.stringify(this.tasks))
        }
        catch(error) {
            alert(error.message)
        }
    }
    loadFromLocalStorage() {
        try{
            let data = localStorage.getItem("tasks")
            return (data && data!=="undefined" && data!=="null") ? JSON.parse(data) : []
        }
        catch(error) {
            alert(error.message)
            return []
        }
    }
    updateTaskStatus(id,newStatus) {
        const task = this.getTaskById(id)
        if(task) {
            task.updateStatus(newStatus)
            this.saveToLocalStorage()
        }
    }
    updateTaskTitle(id,newTitle) {
        const task = this.getTaskById(id)
        if(task) {
            task.updateTitle(newTitle)
            this.saveToLocalStorage()
        }
    }
}
class UIManager {
    constructor() {
        this.manager = new TaskManager()
        this.currentPriorityFilter = localStorage.getItem("priority") || "all"
        this.currentSortOrder = localStorage.getItem("sort-order") || "new"
        this.currentSearchQuery = ""
        this.currentEditingTaskId = null 
    }
    render() {
        let todoLength = 0
        let progressLength = 0
        let doneLength = 0
        this.manager.tasks.forEach(task => {
            if(task.status==="todo") {
                todoLength++
            }
            else if(task.status==="progress") {
                progressLength++
            }
            else {
                doneLength++
            }
        })
        document.getElementById("todo-header").textContent= `To Do(${todoLength})`
        document.getElementById("progress-header").textContent= `Progress(${progressLength})`
        document.getElementById("done-header").textContent= `Done(${doneLength})`
        let tasks = [...this.manager.tasks]
        if(this.currentSearchQuery.trim().length>0) {
            tasks = tasks.filter(task => task.title.toLowerCase().includes(this.currentSearchQuery.toLowerCase()))
        }
        if(this.currentPriorityFilter!=="all") {
            tasks = tasks.filter(task => task.priority===this.currentPriorityFilter)
        }
        if(this.currentSortOrder==="new") {
            tasks = tasks.sort((a,b) => b.createdAt.getTime()-a.createdAt.getTime())
        }
        else {
            tasks = tasks.sort((a,b) => a.createdAt.getTime()-b.createdAt.getTime())
        }
        if(tasks.length===0) {
            let messageDiv = document.getElementById("message")
            messageDiv.innerHTML = ""
            document.querySelector(".board").style.display = "none"
            let message = document.createElement("p")
            if (this.manager.tasks.length === 0) {
                message.textContent = "No tasks yet"
            } else {
                message.textContent = "No results found for current filters/search"
}
            message.classList.add("message")
            messageDiv.appendChild(message)
        }
        else {
            document.querySelector(".board").style.display = "flex"
            document.getElementById("message").innerHTML = ""
        }
        const todo = document.querySelector(".todo-column-container")
        const progress = document.querySelector(".in-progress-column-container")
        const done = document.querySelector(".done-column-container")
        todo.innerHTML = ""
        progress.innerHTML = ""
        done.innerHTML = ""
        for(let task of tasks) {
            const container = document.createElement("div")
            container.classList.add("task")
            const title = document.createElement("p")
            title.classList.add("title-txt")
            const delBtn = document.createElement("button")
            delBtn.textContent = "Delete"
            delBtn.dataset.id = task.id
            delBtn.classList.add("delete-btn")
            delBtn.setAttribute("type","button")
            const editBtn = document.createElement("button")
            editBtn.textContent = "Edit"
            editBtn.dataset.id = task.id
            editBtn.classList.add("edit-btn")
            editBtn.setAttribute("type","button")
            const priority = document.createElement("p")
            priority.classList.add("task-priority")
            if(task.priority==="high") {
                priority.classList.add("high")
            }
            else if(task.priority==="medium") {
                priority.classList.add("medium")
            }
            else if(task.priority==="low") {
                priority.classList.add("low")
            }
            const date = document.createElement("p")
            title.textContent = `Title : ${task.title}`
            priority.textContent = `Priority : ${task.priority}`
            date.textContent = `Created At : ${task.createdAt.toDateString()}`
            date.classList.add("created-at")
            container.appendChild(title)
            container.appendChild(priority)
            container.appendChild(date)
            container.appendChild(delBtn)
            container.appendChild(editBtn)
            if(task.status === "todo") {
                const moveNext = document.createElement("button")
                moveNext.textContent = "Move to Progress"
                moveNext.dataset.id = task.id
                moveNext.dataset.targetStatus = "progress"
                moveNext.classList.add("move-btn")
                moveNext.classList.add("next")
                moveNext.setAttribute("type","button")
                container.appendChild(moveNext)
                todo.appendChild(container)
            }
            else if(task.status === "progress") {
                const moveNext = document.createElement("button")
                moveNext.textContent = "Move to Done"
                moveNext.dataset.id = task.id
                moveNext.dataset.targetStatus = "done"
                moveNext.classList.add("move-btn")
                moveNext.classList.add("next")
                moveNext.setAttribute("type","button")
                const movePrevious = document.createElement("button")
                movePrevious.textContent = "Move to ToDo"
                movePrevious.dataset.id = task.id
                movePrevious.dataset.targetStatus = "todo"
                movePrevious.classList.add("move-btn")
                movePrevious.setAttribute("type","button")
                container.appendChild(movePrevious)
                container.appendChild(moveNext)
                progress.appendChild(container)
            }
            else if(task.status === "done") {
                const movePrevious = document.createElement("button")
                movePrevious.textContent = "Move to Progress"
                movePrevious.dataset.id = task.id
                movePrevious.dataset.targetStatus = "progress"
                movePrevious.classList.add("move-btn")
                movePrevious.setAttribute("type","button")
                container.appendChild(movePrevious)
                done.appendChild(container)
            }
        }
        if(todoLength===0) {
            let noTask = document.createElement("p")
            noTask.textContent = "No tasks here"
            noTask.classList.add("no-task")
            todo.appendChild(noTask)
        }
        if(progressLength===0) {
            let noTask = document.createElement("p")
            noTask.textContent = "No tasks here"
            noTask.classList.add("no-task")
            progress.appendChild(noTask)
        }
        if(doneLength===0) {
            let noTask = document.createElement("p")
            noTask.textContent = "No tasks here"
            noTask.classList.add("no-task")
            done.appendChild(noTask)
        }
    }
    createTask() {
        const title = document.getElementById("title").value.trim()
        if(title.length===0) {
            alert("title is empty")
            return false
        }
        const status = document.getElementById("stat").value
        if(status==="status") {
            alert("choose status")
            return false
        }
        const priority = document.getElementById("pri").value
        if(priority==="priority") {
            alert("choose priority")
            return false
        }
        this.manager.addTask(title,status,priority)
        this.render()
        return true
    }
}
document.addEventListener("DOMContentLoaded",() => {
    const view = new UIManager() 
    document.getElementById("filter-priority").value = view.currentPriorityFilter
    document.getElementById("sort-order").value = view.currentSortOrder
    view.render()
    document.querySelector("form").addEventListener("submit",(event) => {
        event.preventDefault()
        const isCreated = view.createTask()
        if(isCreated) {
            event.currentTarget.reset()
        }
    })
    document.querySelector(".board").addEventListener("click",(event) => {
        if(event.target.classList.contains("delete-btn")) {
            const taskId = Number(event.target.dataset.id)
            view.manager.deleteTask(taskId)
            view.render()
            return 
        }
         if(event.target.classList.contains("move-btn")) {
             const taskId = Number(event.target.dataset.id)
             const taskStatus = event.target.dataset.targetStatus
             view.manager.updateTaskStatus(taskId,taskStatus)
             view.render()
             return
            }
            if(event.target.classList.contains("edit-btn")) {
                const taskId = Number(event.target.dataset.id)
                const task = view.manager.getTaskById(taskId)
                if(!task) {
                    return
                }
                view.currentEditingTaskId = taskId
                document.getElementById("modal-input").value = task.title
                document.getElementById("overlay").style.display = "flex"
        }
    })
    document.getElementById("save").addEventListener("click", () => {
    const modalInput = document.getElementById("modal-input")
    const newTitle = modalInput.value.trim()

    if (newTitle.length === 0) {
        alert("Title cannot be empty")
        return
    }

    view.manager.updateTaskTitle(view.currentEditingTaskId, newTitle)
    view.render()
    document.getElementById("overlay").style.display = "none"
    view.currentEditingTaskId = null
    modalInput.value = ""
    })
    document.getElementById("cancel").addEventListener("click",(event) => {
        view.currentEditingTaskId = null
        document.getElementById("modal-input").value = ""
        document.getElementById("overlay").style.display = "none"
    })
    document.getElementById("filter-priority").addEventListener("change",(event) => {
        view.currentPriorityFilter = event.target.value
        localStorage.setItem("priority",view.currentPriorityFilter)
        view.render()
    })
    document.getElementById("sort-order").addEventListener("change",(event) => {
        view.currentSortOrder = event.target.value
        localStorage.setItem("sort-order",view.currentSortOrder)
        view.render()
    })
    document.getElementById('search').addEventListener("input",(event) => {
        view.currentSearchQuery = event.target.value
        view.render()
    })
    document.getElementById("modal-input").addEventListener("keydown",(event) => {
        if(event.key==="Enter") {
            event.preventDefault()
            document.getElementById("save").click()
        }
    })
    document.getElementById("overlay").addEventListener("click",(event) => {
        let clickinside = document.getElementById("modal").contains(event.target)
        if(!clickinside) {
            document.getElementById("cancel").click()
        }
    })
})
