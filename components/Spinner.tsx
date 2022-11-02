type SpinnerProps = {
  text?: string;
  size?: string;
};

export function Spinner({ text, size = '1em' }: SpinnerProps) {
  return (
    <div className='spinner'>
      <h4> {text} </h4>
      <div className='loader' style={{ height: size, width: size }} />
    </div>
  );
}
