import useConnect from "../hooks/useConnect";

const Hoge = () => {
    const [socket, connecting, error]  = useConnect()
    return (
        <>
            <p>hoge: {typeof(socket)}</p>
        </>
    )
}

export default Hoge