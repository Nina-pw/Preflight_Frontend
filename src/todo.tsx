import { useEffect, useState } from "react";
import axios from "axios";
import { type TodoItem } from "./types";
import dayjs from "dayjs";

function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");


  async function fetchData() {
    try {
      const res = await axios.get<TodoItem[]>("/api/todo");
      setTodos(res.data);
    } catch (err) {
      alert("Failed to fetch todos");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescription(e.target.value);
  }

  function handleSubmit() {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (mode === "ADD") {
      axios
        .put("/api/todo", { title, description })
        .then(() => {
          setTitle("");
          setDescription("");
        })
        .then(fetchData)
        .catch((err) => alert(err));
    } else {
      axios
        .patch("/api/todo", { id: curTodoId, title, description })
        .then(() => {
          setTitle("");
          setDescription("");
          setMode("ADD");
          setCurTodoId("");
        })
        .then(fetchData)
        .catch((err) => alert(err));
    }
  }

  function handleDelete(id: string) {
    axios
      .delete("/api/todo", { data: { id } })
      .then(fetchData)
      .then(() => {
        setMode("ADD");
        setTitle("");
        setDescription("");
      })
      .catch((err) => alert(err));
  }

  function handleCancel() {
    setMode("ADD");
    setTitle("");
    setDescription("");
    setCurTodoId("");
  }

  function handleLogout() {
  localStorage.removeItem("token");
  delete axios.defaults.headers.common.Authorization;
  window.location.href = "/login";
}


  function handleToggleDone(id: string, done: boolean) {
    axios
      .patch("/api/todo", { id, isDone: done })
      .then(fetchData)
      .catch((err) => alert(err));
  }

  return (
    <div className="container">
      <header>
        <h1>Todo App</h1>
        <button onClick={handleLogout}>Logout</button>
        <br />
      </header>
      <main>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={handleTitleChange}
            data-cy="input-title"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            data-cy="input-description"
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleSubmit} data-cy="submit">
              {mode === "ADD" ? "Submit" : "Update"}
            </button>
            {mode === "EDIT" && (
              <button onClick={handleCancel} className="secondary">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div data-cy="todo-item-wrapper" style={{ marginTop: "2rem" }}>
          {todos
            .sort(compareDate)
            .map((item, idx) => {
              const { date, time } = formatDateTime(item.createdAt);
              return (
                <article
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>({idx + 1})</div>
                  <div>📅 {date}</div>
                  <div>⏰ {time}</div>
                  <input
                    type="checkbox"
                    checked={item.isDone}
                    onChange={() => handleToggleDone(item.id, !item.isDone)}
                    data-cy="todo-item-done-toggle"
                  />
                  <div style={{ flexGrow: 1 }}>
                    <strong style={{ textDecoration: item.isDone ? "line-through" : undefined }}>
                      {item.title}
                    </strong>
                    <div
                      style={{
                        fontSize: "0.9em",
                        color: item.isDone ? "#888" : "#333",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {item.description || <i>No description</i>}
                    </div>
                  </div>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setMode("EDIT");
                      setCurTodoId(item.id);
                      setTitle(item.title);
                      setDescription(item.description || "");
                    }}
                    data-cy="todo-item-update"
                  >
                    {curTodoId !== item.id ? "🖊️" : "✍🏻"}
                  </div>

                  {mode === "ADD" && (
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(item.id)}
                      data-cy="todo-item-delete"
                    >
                      🗑️
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      </main>
    </div>
  );
}

export default TodoPage;

function formatDateTime(dateStr: string | Date) {
  if (!dayjs(dateStr).isValid()) {
    return { date: "N/A", time: "N/A" };
  }
  const dt = dayjs(dateStr);
  return {
    date: dt.format("D/MM/YY"),
    time: dt.format("HH:mm"),
  };
}

function compareDate(a: TodoItem, b: TodoItem) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}
