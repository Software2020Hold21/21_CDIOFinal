import data.BrugerDAO;
import data.DALException;

public class main {

    public static void main(String[] args) throws DALException {
        BrugerDAO brugerDAO = new BrugerDAO();
       // brugerDAO.getBruger(001);
        brugerDAO.getBruger(003);
    }
    //Oprettet for at mappestrukturen kommer på git

}
