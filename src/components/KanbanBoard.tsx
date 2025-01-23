import PlusIcon from '../icons/PlusIcon'
import { useEffect, useMemo, useState } from 'react';
import { Column, Id, Task } from '../types/columnTypes';
import ColumnContainer from './ColumnContainer';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map(column => column.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // displacement is needed to start the drag sequence
      },
    })
  );

   // Load data from localStorage when the component mounts
   useEffect(() => {
    const storedColumns = localStorage.getItem('columns');
    const storedTasks = localStorage.getItem('tasks');

    if (storedColumns) {
      try {
        const parsedColumns = JSON.parse(storedColumns);
        if (parsedColumns.length > 0) {
          setColumns(parsedColumns);
        } else {
          // Initialize with default columns if parsedColumns is empty
          const defaultColumns: Column[] = [
            { id: '1', title: 'To Do' },
            { id: '2', title: 'In Progress'},
            { id: '3', title: 'Done' },
          ];
          setColumns(defaultColumns);
        }
      } catch (error) {
        console.error('Error parsing columns from localStorage:', error);
      }
    } else {
      // Initialize with default columns if no data in localStorage
      const defaultColumns: Column[] = [
        { id: '1', title: 'To Do' },
        { id: '2', title: 'In Progress'},
        { id: '3', title: 'Done' },
      ];
      setColumns(defaultColumns);
    }

    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing tasks from localStorage:', error);
      }
    }
  }, []);

  // Save columns to localStorage whenever columns state changes
  useEffect(() => {
    localStorage.setItem('columns', JSON.stringify(columns));
  }, [columns]);

  // Save tasks to localStorage whenever tasks state changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);


  return (
    <div className="
        m-auto
        flex
        flex-col
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        md:px-[40px]
        xl:my-auto
        py-4 xl:py-0
    ">
      {/* DndContext is a component that provides the context for drag and drop interactions */}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="mt-4 mx-auto flex gap-4 flex-col">
          
            <div className="flex flex-col self-start p-2">
                <h1 className="font-bold uppercase text-lg">TaskBoard</h1>
                <p className="text-sm text-slate-500">Streamline Your Workflow with Easy Task Management</p>
            </div>

            <button
              onClick={() => createNewColumn()}
              className=" h-[46px]
              w-[350px]
              cursor-pointer
              rounded-lg
              bg-mainBackgroundColor
              border-2
              border-columnBackgroundColor
              p-2 ring-slate-600
              hover:ring-2
              flex
              items-center
              gap-2
              font-medium
              ">
                <PlusIcon /> Add Column
            </button>

            <div className="flex gap-4 flex-wrap flex-col md:flex-row md:flex-nowrap">
              <SortableContext items={columnsId}>
                {columns.map((column) => (
                    <ColumnContainer
                        key={column.id}
                        column={column}
                        tasks={tasks.filter(task => task.columnId === column.id)}
                        deleteColumn={deleteColumn}
                        updateColumn={updateColumn}
                        createTask={createTask}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                    />
                ))}
              </SortableContext>
            </div>
            
        </div>

        {/* DragOverlay is a component that renders the drag preview */}
        {
          createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              /> 
            )}
            { activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )
            }
          </DragOverlay>
          , document.body)
        }
      </DndContext>
    </div>
  )

  function createNewColumn() {
    // This function will be called when the button is clicked
    const newColumn: Column = {
        id: generateId(),
        title: `Column ${columns.length + 1}`
    };

    // Add the new column to the columns state
    setColumns([...columns, newColumn]);
  }

  function deleteColumn(id: Id) {
    // Filter out the column with the given ID
    const filteredColumns = columns.filter(column => column.id !== id);
    // Update the columns state
    setColumns(filteredColumns);

    const filteredTasks = tasks.filter(task => task.columnId !== id);
    setTasks(filteredTasks);
  }

  function updateColumn( id: Id, title: string) {
    // Find the column with the given ID
    const updatedColumns = columns.map(column => {
      // If the column ID does not match, return the column as is
      if (column.id !== id) return column;
      // If the column ID matches, update the title
      return {
        ...column,
        title
      };

    });
    // Update the columns state
    setColumns(updatedColumns);

  }

  function createTask(columnId: Id) {
    // This function will be called when the "Add Task" button is clicked
    const newTask: Task = {
        id: generateId(),
        columnId: columnId,
        content: `Task ${tasks.length + 1}`,
        priority: 'low'
    };

    // Add the new task to the tasks state
    setTasks([...tasks, newTask]);
  }

  function deleteTask(taskId: Id) {
    // Filter out the task with the given ID
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    // Update the tasks state
    setTasks(filteredTasks);
  }

  function updateTask(taskId: Id, content: string, priority: 'low' | 'medium' | 'high') {
    // Find the task with the given ID
    const updatedTasks = tasks.map(task => {
      // If the task ID does not match, return the task as is
      if (task.id !== taskId) return task;
      // If the task ID matches, update the content
      return {
        ...task,
        content,
        priority
      };

    });
    // Update the tasks state
    setTasks(updatedTasks);

  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const {active, over} = event;
    if(!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if(activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(column => column.id === activeColumnId);
      const overColumnIndex = columns.findIndex(column => column.id === overColumnId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    })
  }

  function onDragOver(event: DragOverEvent) {
    const {active, over} = event;

    if(!over) return;

    const activeId = active.id;
    const overId = over.id;

    if(activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(task => task.id === activeId);
        const overIndex = tasks.findIndex(task => task.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type ==="Column";
    // Dropping a task over a column
    if(isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(task => task.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

}

function generateId() {
  // This is a simple implementation of a random ID generator
  return Math.floor(Math.random() * 10001);
}


export default KanbanBoard