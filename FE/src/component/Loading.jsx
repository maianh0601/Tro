const Spinner = () => {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <svg
        className="w-14 md:w-16 lg:w-20 animate-rotate"
        viewBox="25 25 50 50"
      >
        <circle
          className="stroke-primary animate-dash"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
        ></circle>
      </svg>
    </div>
  );
};

export default Spinner;
