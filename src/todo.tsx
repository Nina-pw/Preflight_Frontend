import { useEffect, useRef, useState } from "react"; 
import axios from "axios";
import { type TodoItem } from "./types";
import dayjs from "dayjs";
import { Pencil, Trash2 } from "lucide-react";
import { type UserInfo } from "./types";
import "./todo.css";

function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#ffc6cf");
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [owner, setOwner] = useState<UserInfo | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [formError, setFormError] = useState("");

  async function fetchData() {
    try {
      const res = await axios.get<{ user: UserInfo; todos: TodoItem[] }>(
        "/api/todo"
      );
      setTodos(res.data.todos);
      setOwner(res.data.user);
    } catch (err) {
      console.error("Failed to fetch todos and user", err);
      setTodos([]);
      setOwner(null);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescription(e.target.value);
  }

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setColor(e.target.value);
  }

  function handleSubmit() {
    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }

    setFormError("");

    if (mode === "ADD") {
      handleAddTodo();
    } else {
      handleUpdateTodo();
    }

    setShowForm(false);
  }

  function handleAddTodo() {
    const payload = {
      title,
      description,
      color,
      isDone: false,
    };

    axios
      .put("/api/todo", payload)
      .then(() => {
        resetForm();
        fetchData();
      })
      .catch((err) => {
        setFormError("Failed to add todo.");
        console.error(err);
      });
  }

  function handleUpdateTodo() {
    if (!curTodoId) return;

    const payload = {
      id: curTodoId,
      title,
      description,
      color,
      isDone: false,
    };

    axios
      .patch("/api/todo", payload)
      .then(() => {
        resetForm();
        fetchData();
      })
      .catch((err) => {
        setFormError("Failed to update todo.");
        console.error(err);
      });
  }


  function handleDelete(id: string) {
    axios
      .delete("/api/todo", { data: { id } })
      .then(() => {
        resetForm();
        fetchData();
      })
      .catch((err) => alert(err));
  }

  function isDarkColor(hexColor: string): boolean {
    
    const hex = hexColor.replace("#", "");
   
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 128; 
  }

  function handleCancel() {
    resetForm(); 
    setShowForm(false);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setColor("#ffc6cf");
    setMode("ADD");
    setCurTodoId("");
    setFormError("");
    // setShowForm(false);
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
    <div className="todo-container">
      <header className="todo-header">
        <h1>
          Start your Todo <span>({todos.length})</span>
        </h1>

        {/* name user */}
        <div style={{ paddingRight: "1rem" }}>
          <div
            className="user-profile"
            onClick={() => setShowDropdown(!showDropdown)}
            ref={dropdownRef}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${
                owner?.firstName || "U"
              }+${owner?.lastName || ""}`}
              alt="Avatar"
              className="avatar"
            />
            <span className="username">
              {owner ? `${owner.firstName} ${owner.lastName}` : "User"}
            </span>

            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showForm && (
        <div className="todo-popup-overlay">
          <div className="todo-popup">
            <div className="todo-form">
              <h2>What do you need to do?</h2>

              {formError && <p className="form-error-message">{formError}</p>}

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
              <div className="color-picker">
                <label>Color: </label>
                <input
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                />
              </div>
              <div className="todo-form-buttons">
                <button
                  onClick={handleSubmit}
                  data-cy="submit"
                  type="submit"
                  className="submit-button"
                >
                  {mode === "ADD" ? "Add" : "Update"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="todo-grid" data-cy="todo-item-wrapper">
        <div
          className="sticky-note add-button-box"
          onClick={() => setShowForm(true)}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "3rem" }}>＋</span>
        </div>

        {todos.sort(compareDate).map((item) => (
          <div
            key={item.id}
            className="sticky-note"
            style={{
              backgroundColor: item.color,
              color: isDarkColor(item.color || "#fdfd96") ? "#fff" : "#000", 
              opacity: item.isDone ? 0.5 : 1,
            }}
          >
            <div className="note-header">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={item.isDone}
                  onChange={() => handleToggleDone(item.id, !item.isDone)}
                  data-cy="todo-item-done-toggle"
                />
                <span className="checkmark">{item.isDone && "✓"}</span>
              </label>
              <span
                className="note-time"
                style={{
                  backgroundColor: item.color,
                  color: isDarkColor(item.color || "#ffc6cf") ? "#fff" : "#000", 
                }}
              >
                {formatDateTime(item.createdAt).time}
              </span>
            </div>
            <h3
              style={{
                textDecoration: item.isDone ? "line-through" : undefined,
              }}
            >
              {item.title}
            </h3>
            <div className="note-description">
              <p>{item.description || <i>No description</i>}</p>
            </div>

            <div className="note-footer">
              <span
                className="note-date"
                style={{
                  backgroundColor: item.color,
                  color: isDarkColor(item.color || "#ffc6cf") ? "#fff" : "#000", 
                }}
              >
                {formatDateTime(item.createdAt).date}
              </span>

              <div
                className="note-actions"
                style={
                  {
                    "--item-color": item.color || "#ffc6cf",
                  } as React.CSSProperties
                }
              >
                <button
                  onClick={() => {
                    setMode("EDIT");
                    setCurTodoId(item.id);
                    setTitle(item.title);
                    setDescription(item.description || "");
                    setColor(item.color || "#ffc6cf");
                    setShowForm(true);
                  }}
                  className={`icon-button edit ${
                    isDarkColor(item.color || "#ffc6cf")
                      ? "light-text"
                      : "dark-text"
                  }`}
                >
                  <Pencil size={20} />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className={`icon-button delete ${
                    isDarkColor(item.color || "#ffc6cf")
                      ? "light-text"
                      : "dark-text"
                  }`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoPage;

function formatDateTime(dateStr: string | Date) {
  const dt = dayjs(dateStr);
  return {
    date: dt.format("D MMMM YYYY"),
    time: dt.format("HH:mm"),
  };
}

function compareDate(a: TodoItem, b: TodoItem) {
  return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
}
