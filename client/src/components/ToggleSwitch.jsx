import { useState, useEffect } from 'react';

const ToggleSwitch = ({ isChecked, onToggle }) => {
  const [checked, setChecked] = useState(isChecked);

  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  const handleToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onToggle(newChecked);
  };

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={checked}
        onChange={handleToggle}
      />
      <div className="relative w-6 h-3 bg-indigo-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer dark:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[] after:left-[1px] after:bg-white after:border-black after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
      <span className="ml-2 text-xs">
        {checked ? 'admin' : 'user'}
      </span>
    </label>
  );
};

export default ToggleSwitch;
