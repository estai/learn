<?php
/**
 * Created by IntelliJ IDEA.
 * User: Естай
 * Date: 06.08.2016
 * Time: 17:03
 */

namespace CommonBundle\Entity\UserAdmin;

use Doctrine\ORM\Mapping as ORM;
use FOS\UserBundle\Model\User as BaseUser;

/**
 * @ORM\Entity
 * @ORM\Table(name="user_admins")
 */
class UserAdmin extends BaseUser
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * UserAdmin constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }
}